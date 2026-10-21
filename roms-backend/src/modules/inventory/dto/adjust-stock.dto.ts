import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StockMovementType } from '@prisma/client';

export class AdjustStockDto {
  @ApiProperty({
    description: 'Số lượng thay đổi (dương: nhập thêm, âm: xuất kho/hỏng)',
    example: 5.0,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  deltaQuantity: number;

  @ApiProperty({
    enum: StockMovementType,
    example: StockMovementType.ADJUSTMENT,
    default: StockMovementType.ADJUSTMENT,
  })
  @IsOptional()
  @IsEnum(StockMovementType)
  movementType?: StockMovementType;

  @ApiPropertyOptional({
    example: 'Kiểm kê định kỳ cuối ca',
    description: 'Ghi chú lý do',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
