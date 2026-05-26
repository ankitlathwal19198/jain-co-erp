import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export type ExtensionAction = 'approve' | 'reject';

export class DecideExtensionDto {
  @IsIn(['approve', 'reject'])
  action: ExtensionAction;

  @IsOptional()
  @IsDateString()
  overrideDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  decisionNote?: string;
}
