import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0)
  amountPaid: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionCode?: string;
}
