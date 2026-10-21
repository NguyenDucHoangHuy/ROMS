import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: dto.phone },
          ...(dto.email ? [{ email: dto.email }] : []),
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Phone or email already exists');
    }

    const role = await this.prisma.role.findUnique({
      where: { name: dto.role },
    });
    if (!role) throw new NotFoundException('Role not found');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        avatarUrl: dto.avatarUrl,
        roleId: role.id,
      },
      include: { role: true },
    });

    return this.toUserResponse(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => this.toUserResponse(u));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.toUserResponse(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    // Nếu cập nhật role, tìm roleId
    let roleId: string | undefined;
    if (dto.role) {
      const role = await this.prisma.role.findUnique({
        where: { name: dto.role },
      });
      if (!role) throw new NotFoundException('Role not found');
      roleId = role.id;
    }

    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    }

    if (dto.phone || dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(dto.phone ? [{ phone: dto.phone }] : []),
            ...(dto.email ? [{ email: dto.email }] : []),
          ],
        },
      });
      if (existing)
        throw new ConflictException('Phone or email already exists');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        phone: dto.phone,
        email: dto.email,
        fullName: dto.fullName,
        avatarUrl: dto.avatarUrl,
        isActive: dto.isActive,
        ...(roleId && { roleId }),
        ...(passwordHash && { passwordHash }),
      },
      include: { role: true },
    });

    return this.toUserResponse(user);
  }

  async remove(id: string) {
    // Soft delete (deactivate)
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: { role: true },
    });
    return this.toUserResponse(user);
  }

  private toUserResponse(user: any) {
    const { passwordHash, ...safeUser } = user;
    return {
      ...safeUser,
      role:
        typeof user.role === 'object' && user.role?.name
          ? user.role.name
          : user.role,
      roleDetails: user.role,
    };
  }
}
