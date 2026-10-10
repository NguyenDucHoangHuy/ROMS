import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  billId: string;

  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  amountPaid: number;

  @IsOptional()
  @IsString()
  transactionCode?: string;
}
