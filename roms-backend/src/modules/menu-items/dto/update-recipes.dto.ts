import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class RecipeItemDto {
  @ApiProperty({ example: 'uuid-inventory-item' })
  @IsString()
  @IsNotEmpty()
  inventoryItemId: string;

  @ApiProperty({
    example: 0.18,
    description: 'Số lượng nguyên liệu cho 1 phần ăn',
  })
  @IsNumber()
  @Min(0.0001)
  quantityRequired: number;
}

export class UpdateRecipesDto {
  @ApiProperty({ type: [RecipeItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  recipes: RecipeItemDto[];
}
