import { TaskFrequency, TaskPriority } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsEnum(TaskFrequency)
  frequency: TaskFrequency;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsDateString()
  initialPlannedDate: string;

  @IsOptional()
  @IsDateString()
  recurrenceEndDate?: string;

  @IsUUID()
  assigneeId: string;
}
