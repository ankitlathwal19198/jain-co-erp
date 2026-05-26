import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateExtensionDto {
  @IsDateString()
  requestedDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}
