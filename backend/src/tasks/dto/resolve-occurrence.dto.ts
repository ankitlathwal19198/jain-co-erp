import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ResolveOccurrenceDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
