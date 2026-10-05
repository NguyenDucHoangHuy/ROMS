import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO đăng ký tài khoản CUSTOMER mới.
 * Chỉ dùng cho khách hàng tự đăng ký qua web QR.
 * Các role nội bộ (WAITER, CHEF...) được ADMIN/MANAGER tạo qua UsersModule.
 */
export class RegisterDto {
  @ApiProperty({
    example: '0901234567',
    description: 'Số điện thoại — dùng làm username đăng nhập',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(0|\+84)[0-9]{9}$/, {
    message: 'phone must be a valid Vietnamese phone number (e.g. 0901234567)',
  })
  phone: string;

  @ApiProperty({
    example: 'NguyenVanA@123',
    description: 'Mật khẩu — tối thiểu 8 ký tự',
  })
  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters' })
  @MaxLength(64)
  password: string;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên đầy đủ',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @ApiPropertyOptional({
    example: 'nguyenvana@gmail.com',
    description: 'Email (không bắt buộc)',
  })
  @IsOptional()
  @IsEmail({}, { message: 'email must be a valid email address' })
  email?: string;
}
