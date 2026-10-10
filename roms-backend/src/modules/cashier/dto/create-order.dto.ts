import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  tableId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  customerCount: number;

  @IsOptional()
  @IsUUID()
  waiterId?: string;
}
