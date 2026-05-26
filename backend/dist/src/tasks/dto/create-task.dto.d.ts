import { TaskFrequency, TaskPriority } from '@prisma/client';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    priority: TaskPriority;
    frequency: TaskFrequency;
    startDate?: string;
    initialPlannedDate: string;
    recurrenceEndDate?: string;
    assigneeId: string;
}
