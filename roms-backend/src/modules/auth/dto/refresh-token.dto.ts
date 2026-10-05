import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** DTO gửi Refresh Token để đổi lấy cặp Access + Refresh Token mới. */
export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token nhận được từ lần login trước',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
