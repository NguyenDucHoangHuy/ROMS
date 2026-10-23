import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DepositStatus } from '@prisma/client';

export class ReservationItemDto {
  @ApiProperty({ description: 'ID món ăn' })
  @IsUUID()
  @IsNotEmpty()
  menuItemId: string;

  @ApiProperty({ description: 'Số lượng món', example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Đơn giá món', example: 12.5 })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Ghi chú cho món ăn', example: 'Ít đường, không đá' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateReservationDto {
  @ApiProperty({ example: 'Nguyễn Văn B' })
  @IsString()
  @IsNotEmpty()
  guestName: string;

  @ApiProperty({ example: '0987654321' })
  @IsString()
  @IsNotEmpty()
  guestPhone: string;

  @ApiProperty({ example: '2026-10-15T19:00:00Z' })
  @IsDateString()
  reservationTime: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  partySize: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialRequest?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  tableId?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  depositAmount?: number;

  @ApiPropertyOptional({ enum: DepositStatus, example: DepositStatus.PENDING })
  @IsOptional()
  @IsEnum(DepositStatus)
  depositStatus?: DepositStatus;

  @ApiPropertyOptional({ type: [ReservationItemDto], description: 'Danh sách món ăn đặt trước' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationItemDto)
  items?: ReservationItemDto[];
}
