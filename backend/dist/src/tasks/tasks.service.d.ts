import { PrismaService } from '../prisma/prisma.service';
import { CreateExtensionDto } from './dto/create-extension.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { DecideExtensionDto } from './dto/decide-extension.dto';
import { ListTasksDto } from './dto/list-tasks.dto';
import { ResolveOccurrenceDto } from './dto/resolve-occurrence.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private assertCanAssign;
    create(assignerId: string, dto: CreateTaskDto): Promise<{
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
    list(currentUserId: string, query: ListTasksDto, viewAll?: boolean): Promise<{
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
    detail(currentUserId: string, taskId: string): Promise<{
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
    update(currentUserId: string, taskId: string, dto: UpdateTaskDto): Promise<{
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
    close(currentUserId: string, taskId: string): Promise<{
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
    markInProgress(currentUserId: string, taskId: string): Promise<{
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
    resolveOccurrence(currentUserId: string, occurrenceId: string, dto: ResolveOccurrenceDto): Promise<{
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
    reopenOccurrence(currentUserId: string, occurrenceId: string): Promise<{
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
    requestExtension(currentUserId: string, occurrenceId: string, dto: CreateExtensionDto): Promise<{
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
    decideExtension(currentUserId: string, extensionId: string, dto: DecideExtensionDto): Promise<{
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
    occurrencesDueToday(currentUserId: string, limit?: number): Promise<({
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
    materializeRecurringOccurrences(now?: Date): Promise<number>;
}
