import type { Request } from 'express';
import { CreateExtensionDto } from './dto/create-extension.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { DecideExtensionDto } from './dto/decide-extension.dto';
import { ListTasksDto } from './dto/list-tasks.dto';
import { ResolveOccurrenceDto } from './dto/resolve-occurrence.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
export declare class TasksController {
    private readonly tasks;
    constructor(tasks: TasksService);
    create(req: Request, dto: CreateTaskDto): Promise<{
        assigner: {
            id: string;
            name: string | null;
            role: {
                name: string;
            } | null;
            email: string;
        };
        assignee: {
            id: string;
            name: string | null;
            role: {
                name: string;
            } | null;
            email: string;
        };
        occurrences: ({
            extensions: ({
                requestedBy: {
                    id: string;
                    name: string | null;
                    email: string;
                };
                decidedBy: {
                    id: string;
                    name: string | null;
                    email: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.ExtensionStatus;
                requestedDate: Date;
                reason: string | null;
                decidedDate: Date | null;
                decidedAt: Date | null;
                decisionNote: string | null;
                occurrenceId: string;
                requestedById: string;
                decidedById: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plannedDate: Date;
            status: import("@prisma/client").$Enums.OccurrenceStatus;
            extendedDate: Date | null;
            actualDate: Date | null;
            delayDays: number | null;
            resolvedNote: string | null;
            taskId: string;
        })[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        priority: import("@prisma/client").$Enums.TaskPriority;
        frequency: import("@prisma/client").$Enums.TaskFrequency;
        startDate: Date | null;
        initialPlannedDate: Date;
        recurrenceEndDate: Date | null;
        status: import("@prisma/client").$Enums.TaskStatus;
        lastGeneratedThrough: Date | null;
        assignerId: string;
        assigneeId: string;
    }>;
    list(req: Request, query: ListTasksDto): Promise<{
        data: ({
            assigner: {
                id: string;
                name: string | null;
                role: {
                    name: string;
                } | null;
                email: string;
            };
            assignee: {
                id: string;
                name: string | null;
                role: {
                    name: string;
                } | null;
                email: string;
            };
            occurrences: ({
                extensions: ({
                    requestedBy: {
                        id: string;
                        name: string | null;
                        email: string;
                    };
                    decidedBy: {
                        id: string;
                        name: string | null;
                        email: string;
                    } | null;
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import("@prisma/client").$Enums.ExtensionStatus;
                    requestedDate: Date;
                    reason: string | null;
                    decidedDate: Date | null;
                    decidedAt: Date | null;
                    decisionNote: string | null;
                    occurrenceId: string;
                    requestedById: string;
                    decidedById: string | null;
                })[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                plannedDate: Date;
                status: import("@prisma/client").$Enums.OccurrenceStatus;
                extendedDate: Date | null;
                actualDate: Date | null;
                delayDays: number | null;
                resolvedNote: string | null;
                taskId: string;
            })[];
        } & {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            priority: import("@prisma/client").$Enums.TaskPriority;
            frequency: import("@prisma/client").$Enums.TaskFrequency;
            startDate: Date | null;
            initialPlannedDate: Date;
            recurrenceEndDate: Date | null;
            status: import("@prisma/client").$Enums.TaskStatus;
            lastGeneratedThrough: Date | null;
            assignerId: string;
            assigneeId: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    today(req: Request): Promise<({
        task: {
            id: string;
            assigner: {
                id: string;
                name: string | null;
                email: string;
            };
            title: string;
            priority: import("@prisma/client").$Enums.TaskPriority;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plannedDate: Date;
        status: import("@prisma/client").$Enums.OccurrenceStatus;
        extendedDate: Date | null;
        actualDate: Date | null;
        delayDays: number | null;
        resolvedNote: string | null;
        taskId: string;
    })[]>;
    detail(req: Request, id: string): Promise<{
        assigner: {
            id: string;
            name: string | null;
            role: {
                name: string;
            } | null;
            email: string;
        };
        assignee: {
            id: string;
            name: string | null;
            role: {
                name: string;
            } | null;
            email: string;
        };
        occurrences: ({
            extensions: ({
                requestedBy: {
                    id: string;
                    name: string | null;
                    email: string;
                };
                decidedBy: {
                    id: string;
                    name: string | null;
                    email: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.ExtensionStatus;
                requestedDate: Date;
                reason: string | null;
                decidedDate: Date | null;
                decidedAt: Date | null;
                decisionNote: string | null;
                occurrenceId: string;
                requestedById: string;
                decidedById: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plannedDate: Date;
            status: import("@prisma/client").$Enums.OccurrenceStatus;
            extendedDate: Date | null;
            actualDate: Date | null;
            delayDays: number | null;
            resolvedNote: string | null;
            taskId: string;
        })[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        priority: import("@prisma/client").$Enums.TaskPriority;
        frequency: import("@prisma/client").$Enums.TaskFrequency;
        startDate: Date | null;
        initialPlannedDate: Date;
        recurrenceEndDate: Date | null;
        status: import("@prisma/client").$Enums.TaskStatus;
        lastGeneratedThrough: Date | null;
        assignerId: string;
        assigneeId: string;
    }>;
    update(req: Request, id: string, dto: UpdateTaskDto): Promise<{
        assigner: {
            id: string;
            name: string | null;
            role: {
                name: string;
            } | null;
            email: string;
        };
        assignee: {
            id: string;
            name: string | null;
            role: {
                name: string;
            } | null;
            email: string;
        };
        occurrences: ({
            extensions: ({
                requestedBy: {
                    id: string;
                    name: string | null;
                    email: string;
                };
                decidedBy: {
                    id: string;
                    name: string | null;
                    email: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.ExtensionStatus;
                requestedDate: Date;
                reason: string | null;
                decidedDate: Date | null;
                decidedAt: Date | null;
                decisionNote: string | null;
                occurrenceId: string;
                requestedById: string;
                decidedById: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plannedDate: Date;
            status: import("@prisma/client").$Enums.OccurrenceStatus;
            extendedDate: Date | null;
            actualDate: Date | null;
            delayDays: number | null;
            resolvedNote: string | null;
            taskId: string;
        })[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        priority: import("@prisma/client").$Enums.TaskPriority;
        frequency: import("@prisma/client").$Enums.TaskFrequency;
        startDate: Date | null;
        initialPlannedDate: Date;
        recurrenceEndDate: Date | null;
        status: import("@prisma/client").$Enums.TaskStatus;
        lastGeneratedThrough: Date | null;
        assignerId: string;
        assigneeId: string;
    }>;
    close(req: Request, id: string): Promise<{
        assigner: {
            id: string;
            name: string | null;
            role: {
                name: string;
            } | null;
            email: string;
        };
        assignee: {
            id: string;
            name: string | null;
            role: {
                name: string;
            } | null;
            email: string;
        };
        occurrences: ({
            extensions: ({
                requestedBy: {
                    id: string;
                    name: string | null;
                    email: string;
                };
                decidedBy: {
                    id: string;
                    name: string | null;
                    email: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.ExtensionStatus;
                requestedDate: Date;
                reason: string | null;
                decidedDate: Date | null;
                decidedAt: Date | null;
                decisionNote: string | null;
                occurrenceId: string;
                requestedById: string;
                decidedById: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plannedDate: Date;
            status: import("@prisma/client").$Enums.OccurrenceStatus;
            extendedDate: Date | null;
            actualDate: Date | null;
            delayDays: number | null;
            resolvedNote: string | null;
            taskId: string;
        })[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        priority: import("@prisma/client").$Enums.TaskPriority;
        frequency: import("@prisma/client").$Enums.TaskFrequency;
        startDate: Date | null;
        initialPlannedDate: Date;
        recurrenceEndDate: Date | null;
        status: import("@prisma/client").$Enums.TaskStatus;
        lastGeneratedThrough: Date | null;
        assignerId: string;
        assigneeId: string;
    }>;
    start(req: Request, id: string): Promise<{
        assigner: {
            id: string;
            name: string | null;
            role: {
                name: string;
            } | null;
            email: string;
        };
        assignee: {
            id: string;
            name: string | null;
            role: {
                name: string;
            } | null;
            email: string;
        };
        occurrences: ({
            extensions: ({
                requestedBy: {
                    id: string;
                    name: string | null;
                    email: string;
                };
                decidedBy: {
                    id: string;
                    name: string | null;
                    email: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.ExtensionStatus;
                requestedDate: Date;
                reason: string | null;
                decidedDate: Date | null;
                decidedAt: Date | null;
                decisionNote: string | null;
                occurrenceId: string;
                requestedById: string;
                decidedById: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plannedDate: Date;
            status: import("@prisma/client").$Enums.OccurrenceStatus;
            extendedDate: Date | null;
            actualDate: Date | null;
            delayDays: number | null;
            resolvedNote: string | null;
            taskId: string;
        })[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        priority: import("@prisma/client").$Enums.TaskPriority;
        frequency: import("@prisma/client").$Enums.TaskFrequency;
        startDate: Date | null;
        initialPlannedDate: Date;
        recurrenceEndDate: Date | null;
        status: import("@prisma/client").$Enums.TaskStatus;
        lastGeneratedThrough: Date | null;
        assignerId: string;
        assigneeId: string;
    }>;
    resolve(req: Request, id: string, dto: ResolveOccurrenceDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plannedDate: Date;
        status: import("@prisma/client").$Enums.OccurrenceStatus;
        extendedDate: Date | null;
        actualDate: Date | null;
        delayDays: number | null;
        resolvedNote: string | null;
        taskId: string;
    }>;
    reopen(req: Request, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plannedDate: Date;
        status: import("@prisma/client").$Enums.OccurrenceStatus;
        extendedDate: Date | null;
        actualDate: Date | null;
        delayDays: number | null;
        resolvedNote: string | null;
        taskId: string;
    }>;
    requestExtension(req: Request, id: string, dto: CreateExtensionDto): Promise<{
        requestedBy: {
            id: string;
            name: string | null;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ExtensionStatus;
        requestedDate: Date;
        reason: string | null;
        decidedDate: Date | null;
        decidedAt: Date | null;
        decisionNote: string | null;
        occurrenceId: string;
        requestedById: string;
        decidedById: string | null;
    }>;
    decideExtension(req: Request, id: string, dto: DecideExtensionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ExtensionStatus;
        requestedDate: Date;
        reason: string | null;
        decidedDate: Date | null;
        decidedAt: Date | null;
        decisionNote: string | null;
        occurrenceId: string;
        requestedById: string;
        decidedById: string | null;
    }>;
}
