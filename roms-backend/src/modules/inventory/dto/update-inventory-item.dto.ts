import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateInventoryItemDto {
  @ApiPropertyOptional({ example: 'Thịt bò Úc & Wagyu Premium' })
  @IsOptional()
  @IsString()
  itemName?: string;

  @ApiPropertyOptional({ example: 'kg' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: 10.0 })
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
