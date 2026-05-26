import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class DoerReportQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;
}
