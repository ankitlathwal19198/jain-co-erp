import { TaskStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export type TaskScope = 'assigned_to_me' | 'assigned_by_me' | 'all';

export class ListTasksDto {
  @IsOptional()
  @IsIn(['assigned_to_me', 'assigned_by_me', 'all'])
  scope?: TaskScope;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  plannedFrom?: string;

  @IsOptional()
  @IsDateString()
  plannedTo?: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
