import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class MergeTablesDto {
  @IsUUID()
  targetTableId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  sourceTableIds: string[];
}
