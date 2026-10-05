import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO đăng nhập — dùng chung cho tất cả role (CUSTOMER, WAITER, CHEF, CASHIER, MANAGER, ADMIN).
 * Dùng số điện thoại + mật khẩu, KHÔNG phân biệt role ở bước này.
 * Role được đọc từ DB và gắn vào JWT payload sau khi xác thực thành công.
 */
export class LoginDto {
  @ApiProperty({
    example: '0901234567',
    description: 'Số điện thoại đăng nhập',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'NguyenVanA@123',
    description: 'Mật khẩu',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
