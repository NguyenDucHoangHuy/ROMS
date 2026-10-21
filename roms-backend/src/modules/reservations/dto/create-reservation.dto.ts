import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { DepositStatus } from '@prisma/client';

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
}
