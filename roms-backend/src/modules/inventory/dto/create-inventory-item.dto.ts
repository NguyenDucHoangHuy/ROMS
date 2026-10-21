import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryItemDto {
  @ApiProperty({ example: 'Thịt bò Úc & Wagyu' })
  @IsNotEmpty()
  @IsString()
  itemName: string;

  @ApiProperty({ example: 'kg' })
  @IsNotEmpty()
  @IsString()
  unit: string;

  @ApiPropertyOptional({ example: 25.0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @ApiPropertyOptional({ example: 5.0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAlertThreshold?: number;

  @ApiPropertyOptional({ example: 'Thịt & Gia cầm' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'ING-BEEF-01' })
  @IsOptional()
  @IsString()
  sku?: string;
}
