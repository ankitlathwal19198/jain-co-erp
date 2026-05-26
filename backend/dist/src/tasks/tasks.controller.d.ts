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
            role: {
                name: string;
            } | null;
            email: string;
            name: string | null;
            id: string;
        };
        assignee: {
            role: {
                name: string;
            } | null;
            email: string;
            name: string | null;
            id: string;
        };
        occurrences: ({
            extensions: ({
                requestedBy: {
                    email: string;
                    name: string | null;
                    id: string;
                };
                decidedBy: {
                    email: string;
                    name: string | null;
                    id: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                requestedDate: Date;
                reason: string | null;
                decisionNote: string | null;
                status: import("@prisma/client").$Enums.ExtensionStatus;
                decidedDate: Date | null;
                decidedAt: Date | null;
                occurrenceId: string;
                requestedById: string;
                decidedById: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.OccurrenceStatus;
            plannedDate: Date;
            extendedDate: Date | null;
            actualDate: Date | null;
            delayDays: number | null;
            resolvedNote: string | null;
            taskId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        priority: import("@prisma/client").$Enums.TaskPriority;
        frequency: import("@prisma/client").$Enums.TaskFrequency;
        startDate: Date | null;
        initialPlannedDate: Date;
        recurrenceEndDate: Date | null;
        assigneeId: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        lastGeneratedThrough: Date | null;
        assignerId: string;
    }>;
    list(req: Request, query: ListTasksDto): Promise<{
        data: ({
            assigner: {
                role: {
                    name: string;
                } | null;
                email: string;
                name: string | null;
                id: string;
            };
            assignee: {
                role: {
                    name: string;
                } | null;
                email: string;
                name: string | null;
                id: string;
            };
            occurrences: ({
                extensions: ({
                    requestedBy: {
                        email: string;
                        name: string | null;
                        id: string;
                    };
                    decidedBy: {
                        email: string;
                        name: string | null;
                        id: string;
                    } | null;
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    requestedDate: Date;
                    reason: string | null;
                    decisionNote: string | null;
                    status: import("@prisma/client").$Enums.ExtensionStatus;
                    decidedDate: Date | null;
                    decidedAt: Date | null;
                    occurrenceId: string;
                    requestedById: string;
                    decidedById: string | null;
                })[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.OccurrenceStatus;
                plannedDate: Date;
                extendedDate: Date | null;
                actualDate: Date | null;
                delayDays: number | null;
                resolvedNote: string | null;
                taskId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            title: string;
            priority: import("@prisma/client").$Enums.TaskPriority;
            frequency: import("@prisma/client").$Enums.TaskFrequency;
            startDate: Date | null;
            initialPlannedDate: Date;
            recurrenceEndDate: Date | null;
            assigneeId: string;
            status: import("@prisma/client").$Enums.TaskStatus;
            lastGeneratedThrough: Date | null;
            assignerId: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    today(req: Request): Promise<({
        task: {
            id: string;
            title: string;
            priority: import("@prisma/client").$Enums.TaskPriority;
            assigner: {
                email: string;
                name: string | null;
                id: string;
            };
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OccurrenceStatus;
        plannedDate: Date;
        extendedDate: Date | null;
        actualDate: Date | null;
        delayDays: number | null;
        resolvedNote: string | null;
        taskId: string;
    })[]>;
    detail(req: Request, id: string): Promise<{
        assigner: {
            role: {
                name: string;
            } | null;
            email: string;
            name: string | null;
            id: string;
        };
        assignee: {
            role: {
                name: string;
            } | null;
            email: string;
            name: string | null;
            id: string;
        };
        occurrences: ({
            extensions: ({
                requestedBy: {
                    email: string;
                    name: string | null;
                    id: string;
                };
                decidedBy: {
                    email: string;
                    name: string | null;
                    id: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                requestedDate: Date;
                reason: string | null;
                decisionNote: string | null;
                status: import("@prisma/client").$Enums.ExtensionStatus;
                decidedDate: Date | null;
                decidedAt: Date | null;
                occurrenceId: string;
                requestedById: string;
                decidedById: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.OccurrenceStatus;
            plannedDate: Date;
            extendedDate: Date | null;
            actualDate: Date | null;
            delayDays: number | null;
            resolvedNote: string | null;
            taskId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        priority: import("@prisma/client").$Enums.TaskPriority;
        frequency: import("@prisma/client").$Enums.TaskFrequency;
        startDate: Date | null;
        initialPlannedDate: Date;
        recurrenceEndDate: Date | null;
        assigneeId: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        lastGeneratedThrough: Date | null;
        assignerId: string;
    }>;
    update(req: Request, id: string, dto: UpdateTaskDto): Promise<{
        assigner: {
            role: {
                name: string;
            } | null;
            email: string;
            name: string | null;
            id: string;
        };
        assignee: {
            role: {
                name: string;
            } | null;
            email: string;
            name: string | null;
            id: string;
        };
        occurrences: ({
            extensions: ({
                requestedBy: {
                    email: string;
                    name: string | null;
                    id: string;
                };
                decidedBy: {
                    email: string;
                    name: string | null;
                    id: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                requestedDate: Date;
                reason: string | null;
                decisionNote: string | null;
                status: import("@prisma/client").$Enums.ExtensionStatus;
                decidedDate: Date | null;
                decidedAt: Date | null;
                occurrenceId: string;
                requestedById: string;
                decidedById: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.OccurrenceStatus;
            plannedDate: Date;
            extendedDate: Date | null;
            actualDate: Date | null;
            delayDays: number | null;
            resolvedNote: string | null;
            taskId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        priority: import("@prisma/client").$Enums.TaskPriority;
        frequency: import("@prisma/client").$Enums.TaskFrequency;
        startDate: Date | null;
        initialPlannedDate: Date;
        recurrenceEndDate: Date | null;
        assigneeId: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        lastGeneratedThrough: Date | null;
        assignerId: string;
    }>;
    close(req: Request, id: string): Promise<{
        assigner: {
            role: {
                name: string;
            } | null;
            email: string;
            name: string | null;
            id: string;
        };
        assignee: {
            role: {
                name: string;
            } | null;
            email: string;
            name: string | null;
            id: string;
        };
        occurrences: ({
            extensions: ({
                requestedBy: {
                    email: string;
                    name: string | null;
                    id: string;
                };
                decidedBy: {
                    email: string;
                    name: string | null;
                    id: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                requestedDate: Date;
                reason: string | null;
                decisionNote: string | null;
                status: import("@prisma/client").$Enums.ExtensionStatus;
                decidedDate: Date | null;
                decidedAt: Date | null;
                occurrenceId: string;
                requestedById: string;
                decidedById: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.OccurrenceStatus;
            plannedDate: Date;
            extendedDate: Date | null;
            actualDate: Date | null;
            delayDays: number | null;
            resolvedNote: string | null;
            taskId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        priority: import("@prisma/client").$Enums.TaskPriority;
        frequency: import("@prisma/client").$Enums.TaskFrequency;
        startDate: Date | null;
        initialPlannedDate: Date;
        recurrenceEndDate: Date | null;
        assigneeId: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        lastGeneratedThrough: Date | null;
        assignerId: string;
    }>;
    start(req: Request, id: string): Promise<{
        assigner: {
            role: {
                name: string;
            } | null;
            email: string;
            name: string | null;
            id: string;
        };
        assignee: {
            role: {
                name: string;
            } | null;
            email: string;
            name: string | null;
            id: string;
        };
        occurrences: ({
            extensions: ({
                requestedBy: {
                    email: string;
                    name: string | null;
                    id: string;
                };
                decidedBy: {
                    email: string;
                    name: string | null;
                    id: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                requestedDate: Date;
                reason: string | null;
                decisionNote: string | null;
                status: import("@prisma/client").$Enums.ExtensionStatus;
                decidedDate: Date | null;
                decidedAt: Date | null;
                occurrenceId: string;
                requestedById: string;
                decidedById: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.OccurrenceStatus;
            plannedDate: Date;
            extendedDate: Date | null;
            actualDate: Date | null;
            delayDays: number | null;
            resolvedNote: string | null;
            taskId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        priority: import("@prisma/client").$Enums.TaskPriority;
        frequency: import("@prisma/client").$Enums.TaskFrequency;
        startDate: Date | null;
        initialPlannedDate: Date;
        recurrenceEndDate: Date | null;
        assigneeId: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        lastGeneratedThrough: Date | null;
        assignerId: string;
    }>;
    resolve(req: Request, id: string, dto: ResolveOccurrenceDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OccurrenceStatus;
        plannedDate: Date;
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
        status: import("@prisma/client").$Enums.OccurrenceStatus;
        plannedDate: Date;
        extendedDate: Date | null;
        actualDate: Date | null;
        delayDays: number | null;
        resolvedNote: string | null;
        taskId: string;
    }>;
    requestExtension(req: Request, id: string, dto: CreateExtensionDto): Promise<{
        requestedBy: {
            email: string;
            name: string | null;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        requestedDate: Date;
        reason: string | null;
        decisionNote: string | null;
        status: import("@prisma/client").$Enums.ExtensionStatus;
        decidedDate: Date | null;
        decidedAt: Date | null;
        occurrenceId: string;
        requestedById: string;
        decidedById: string | null;
    }>;
    decideExtension(req: Request, id: string, dto: DecideExtensionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        requestedDate: Date;
        reason: string | null;
        decisionNote: string | null;
        status: import("@prisma/client").$Enums.ExtensionStatus;
        decidedDate: Date | null;
        decidedAt: Date | null;
        occurrenceId: string;
        requestedById: string;
        decidedById: string | null;
    }>;
}
