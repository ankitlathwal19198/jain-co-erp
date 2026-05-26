import { TaskStatus } from '@prisma/client';
export type TaskScope = 'assigned_to_me' | 'assigned_by_me' | 'all';
export declare class ListTasksDto {
    scope?: TaskScope;
    status?: TaskStatus;
    plannedFrom?: string;
    plannedTo?: string;
    assigneeId?: string;
    page?: number;
    limit?: number;
}
