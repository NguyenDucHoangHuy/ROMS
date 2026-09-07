import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStockReceiptDetailDto {
  @ApiProperty()
  @IsUUID()
  inventoryItemId: string;

  @ApiProperty({ minimum: 0.001 })
  @Type(() => Number)
  @Min(0.001)
  quantity: number;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @Min(0)
  unitPrice: number;
}

export class CreateStockReceiptDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiProperty({ type: [CreateStockReceiptDetailDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateStockReceiptDetailDto)
  details: CreateStockReceiptDetailDto[];
}
