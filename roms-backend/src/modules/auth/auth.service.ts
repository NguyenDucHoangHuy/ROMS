import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type { StringValue } from 'ms';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

/** Số vòng bcrypt hash — 12 là chuẩn bảo mật production (cân bằng giữa bảo mật & hiệu năng) */
const BCRYPT_SALT_ROUNDS = 12;

/**
 * AuthService — Chứa toàn bộ business logic xác thực của ROMS.
 *
 * Các chức năng:
 *  1. register()      — Tạo tài khoản CUSTOMER mới (public)
 *  2. login()         — Xác thực, trả về cặp Access + Refresh Token
 *  3. refreshTokens() — Xoay vòng Refresh Token (Rotation Strategy)
 *  4. logout()        — Thu hồi Refresh Token khỏi DB
 *
 * Token Strategy:
 *  - Access Token:  JWT ngắn hạn (15m), verify bằng JWT_ACCESS_SECRET
 *  - Refresh Token: JWT dài hạn (7d), verify bằng JWT_REFRESH_SECRET,
 *                   lưu HASH (không lưu plaintext) vào bảng refresh_tokens
 *                   → Nếu DB bị lộ, attacker không có token thật
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ============================================================
  // 1. REGISTER — Đăng ký tài khoản CUSTOMER
  // ============================================================

  async register(dto: RegisterDto) {
    // Kiểm tra số điện thoại đã tồn tại chưa
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException(
        `Phone number ${dto.phone} is already registered`,
      );
    }

    // Tìm Role CUSTOMER từ DB (được seed sẵn)
    const customerRole = await this.prisma.role.findUnique({
      where: { name: RoleName.CUSTOMER },
      select: { id: true },
    });

    if (!customerRole) {
      throw new NotFoundException(
        'CUSTOMER role not found. Please run database seeder.',
      );
    }

    // Hash mật khẩu — KHÔNG bao giờ lưu plaintext
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    // Tạo user mới
    const newUser = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        roleId: customerRole.id,
      },
      select: {
        id: true,
        phone: true,
        fullName: true,
        email: true,
        role: { select: { name: true } },
        createdAt: true,
      },
    });

    return {
      message: 'Registration successful',
      user: newUser,
    };
  }

  // ============================================================
  // 2. LOGIN — Xác thực và cấp phát Token
  // ============================================================

  async login(dto: LoginDto, deviceInfo?: string, ipAddress?: string) {
    // Tìm user theo số điện thoại — include role để build JWT payload
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
      select: {
        id: true,
        phone: true,
        fullName: true,
        passwordHash: true,
        isActive: true,
        role: { select: { name: true } },
      },
    });

    // Dùng thông báo chung chung để tránh user enumeration attack
    // (không để lộ "số điện thoại không tồn tại" vs "sai mật khẩu")
    if (!user) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    // Kiểm tra tài khoản có bị deactivate không
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Account has been deactivated. Please contact your manager.',
      );
    }

    // So sánh mật khẩu với hash trong DB
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    // Build JWT payload — đây là dữ liệu được mã hoá vào token
    const payload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      role: user.role.name,
      fullName: user.fullName,
    };

    // Sign cặp Access + Refresh Token
    const tokens = await this.generateTokenPair(payload);

    // Lưu hash của Refresh Token vào DB để có thể thu hồi (revoke) sau này
    await this.saveRefreshTokenToDb(
      user.id,
      tokens.refreshToken,
      deviceInfo,
      ipAddress,
    );

    return {
      ...tokens,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role.name,
      },
    };
  }

  // ============================================================
  // 3. REFRESH TOKENS — Xoay vòng Token (Rotation Strategy)
  // ============================================================

  /**
   * Refresh Token Rotation:
   * Mỗi lần refresh → Thu hồi token cũ + Cấp phát cặp token MỚI hoàn toàn.
   * Nếu token cũ bị dùng lần 2 → Phát hiện reuse → Revoke TẤT CẢ token của user đó.
   */
  async refreshTokens(
    refreshTokenPlaintext: string,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    // 1. Verify chữ ký của Refresh Token bằng JWT_REFRESH_SECRET
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshTokenPlaintext,
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired refresh token. Please login again.',
      );
    }

    // 2. Hash token nhận được để so sánh với DB
    const tokenHash = this.hashToken(refreshTokenPlaintext);

    // 3. Tìm bản ghi Refresh Token trong DB
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        tokenHash,
        revokedAt: null, // Chỉ chấp nhận token chưa bị thu hồi
      },
    });

    if (!storedToken) {
      // Token hợp lệ về chữ ký nhưng KHÔNG có trong DB (hoặc đã bị revoke)
      // → Có thể là token đã dùng (Refresh Token Reuse Attack)
      // → Revoke TẤT CẢ token của user này để bảo vệ tài khoản
      await this.revokeAllUserTokens(payload.sub);
      throw new UnauthorizedException(
        'Refresh token has been revoked or reused. All sessions have been invalidated. Please login again.',
      );
    }

    // 4. Kiểm tra token hết hạn theo DB (double check)
    if (storedToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException(
        'Refresh token has expired. Please login again.',
      );
    }

    // 5. Thu hồi token CŨ (Rotation — mỗi token chỉ dùng 1 lần)
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // 6. Lấy thông tin user mới nhất từ DB (role có thể đã thay đổi)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        phone: true,
        fullName: true,
        isActive: true,
        role: { select: { name: true } },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Account no longer exists or has been deactivated.',
      );
    }

    // 7. Cấp phát cặp token MỚI hoàn toàn
    const newPayload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      role: user.role.name,
      fullName: user.fullName,
    };

    const tokens = await this.generateTokenPair(newPayload);
    await this.saveRefreshTokenToDb(
      user.id,
      tokens.refreshToken,
      deviceInfo,
      ipAddress,
    );

    return tokens;
  }

  // ============================================================
  // 4. LOGOUT — Thu hồi Refresh Token
  // ============================================================

  async logout(userId: string, refreshTokenPlaintext: string) {
    const tokenHash = this.hashToken(refreshTokenPlaintext);

    // Tìm và revoke đúng token của user này (không revoke token của device khác)
    const updated = await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        tokenHash,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    // updated.count === 0 nghĩa là token không tồn tại hoặc đã bị revoke
    // Vẫn trả về success để tránh lộ thông tin
    return {
      message: updated.count > 0
        ? 'Logged out successfully'
        : 'Session was already invalidated',
    };
  }

  // ============================================================
  // Private Helpers
  // ============================================================

  /**
   * Tạo cặp Access Token + Refresh Token cùng lúc (Promise.all để tối ưu).
   */
  private async generateTokenPair(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      // Access Token: ký bằng JWT_ACCESS_SECRET, hạn 15m (cấu hình từ JwtModule)
      this.jwtService.signAsync(payload),

      // Refresh Token: ký riêng bằng JWT_REFRESH_SECRET, hạn 7d
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: (this.config.get<string>('JWT_REFRESH_EXPIRY') ?? '7d') as StringValue,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Lưu hash của Refresh Token vào DB.
   * Lưu HASH (SHA-256) thay vì plaintext — nếu DB bị lộ, attacker không có token thật.
   */
  private async saveRefreshTokenToDb(
    userId: string,
    refreshTokenPlaintext: string,
    deviceInfo?: string,
    ipAddress?: string,
  ) {
    const tokenHash = this.hashToken(refreshTokenPlaintext);

    // Tính thời điểm hết hạn từ config
    const refreshExpiry = this.config.get<string>('JWT_REFRESH_EXPIRY') ?? '7d';
    const expiresAt = this.parseExpiryToDate(refreshExpiry);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        deviceInfo: deviceInfo ?? null,
        ipAddress: ipAddress ?? null,
        expiresAt,
      },
    });
  }

  /** SHA-256 hash của token — nhanh và đủ bảo mật cho token storage */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /** Thu hồi TẤT CẢ refresh token của 1 user (dùng khi phát hiện reuse attack) */
  private async revokeAllUserTokens(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Parse chuỗi expiry ('15m', '7d', '1h') thành Date object.
   * Dùng để lưu expiresAt vào bảng refresh_tokens.
   */
  private parseExpiryToDate(expiry: string): Date {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);
    const now = new Date();

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const ms = (multipliers[unit] ?? multipliers['m']) * value;
    return new Date(now.getTime() + ms);
  }
}
