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
    list(currentUserId: string, query: ListTasksDto, viewAll?: boolean): Promise<{
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
    detail(currentUserId: string, taskId: string): Promise<{
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
    update(currentUserId: string, taskId: string, dto: UpdateTaskDto): Promise<{
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
    close(currentUserId: string, taskId: string): Promise<{
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
    markInProgress(currentUserId: string, taskId: string): Promise<{
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
    resolveOccurrence(currentUserId: string, occurrenceId: string, dto: ResolveOccurrenceDto): Promise<{
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
    reopenOccurrence(currentUserId: string, occurrenceId: string): Promise<{
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
    requestExtension(currentUserId: string, occurrenceId: string, dto: CreateExtensionDto): Promise<{
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
    decideExtension(currentUserId: string, extensionId: string, dto: DecideExtensionDto): Promise<{
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
    occurrencesDueToday(currentUserId: string, limit?: number): Promise<({
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
    materializeRecurringOccurrences(now?: Date): Promise<number>;
}
