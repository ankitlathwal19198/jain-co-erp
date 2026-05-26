"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const permissions_catalog_1 = require("../permissions/permissions.catalog");
const recurrence_util_1 = require("./recurrence.util");
const TASK_WITH_OCCURRENCES = {
    assigner: {
        select: {
            id: true,
            name: true,
            email: true,
            role: { select: { name: true } },
        },
    },
    assignee: {
        select: {
            id: true,
            name: true,
            email: true,
            role: { select: { name: true } },
        },
    },
    occurrences: {
        orderBy: { plannedDate: 'asc' },
        include: {
            extensions: {
                orderBy: { createdAt: 'desc' },
                include: {
                    requestedBy: { select: { id: true, name: true, email: true } },
                    decidedBy: { select: { id: true, name: true, email: true } },
                },
            },
        },
    },
};
let TasksService = TasksService_1 = class TasksService {
    prisma;
    logger = new common_1.Logger(TasksService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assertCanAssign(assignerId, assigneeId) {
        if (assignerId === assigneeId) {
            throw new common_1.BadRequestException('Cannot assign a task to yourself');
        }
        const [assigner, assignee] = await Promise.all([
            this.prisma.user.findUnique({
                where: { id: assignerId },
                include: { role: { select: { name: true } } },
            }),
            this.prisma.user.findUnique({ where: { id: assigneeId } }),
        ]);
        if (!assigner)
            throw new common_1.ForbiddenException('Invalid assigner');
        if (!assignee)
            throw new common_1.NotFoundException('Assignee not found');
        const isAdmin = assigner.role?.name === permissions_catalog_1.SUPER_ADMIN_ROLE;
        const isManager = assignee.reportingManagerId === assignerId;
        if (!isAdmin && !isManager) {
            throw new common_1.ForbiddenException('You can only assign tasks to your direct reports');
        }
    }
    async create(assignerId, dto) {
        await this.assertCanAssign(assignerId, dto.assigneeId);
        const plannedDate = (0, recurrence_util_1.startOfUtcDay)(new Date(dto.initialPlannedDate));
        const startDate = dto.startDate
            ? (0, recurrence_util_1.startOfUtcDay)(new Date(dto.startDate))
            : null;
        const recurrenceEndDate = dto.recurrenceEndDate
            ? (0, recurrence_util_1.startOfUtcDay)(new Date(dto.recurrenceEndDate))
            : null;
        if (recurrenceEndDate && recurrenceEndDate < plannedDate) {
            throw new common_1.BadRequestException('recurrenceEndDate must be on/after initialPlannedDate');
        }
        return this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description,
                priority: dto.priority,
                frequency: dto.frequency,
                startDate,
                initialPlannedDate: plannedDate,
                recurrenceEndDate,
                assignerId,
                assigneeId: dto.assigneeId,
                lastGeneratedThrough: plannedDate,
                occurrences: {
                    create: {
                        plannedDate,
                        status: client_1.OccurrenceStatus.pending,
                    },
                },
            },
            include: TASK_WITH_OCCURRENCES,
        });
    }
    async list(currentUserId, query, viewAll = false) {
        const scope = query.scope ?? 'all';
        const page = Math.max(1, query.page ?? 1);
        const limit = Math.min(100, Math.max(1, query.limit ?? 15));
        const skip = (page - 1) * limit;
        const scopeFilter = scope === 'assigned_to_me'
            ? { assigneeId: currentUserId }
            : scope === 'assigned_by_me'
                ? { assignerId: currentUserId }
                : viewAll
                    ? {}
                    : {
                        OR: [
                            { assigneeId: currentUserId },
                            { assignerId: currentUserId },
                        ],
                    };
        const extraFilters = [];
        if (query.status) {
            extraFilters.push({ status: query.status });
        }
        if (query.assigneeId) {
            extraFilters.push({ assigneeId: query.assigneeId });
        }
        if (query.plannedFrom || query.plannedTo) {
            extraFilters.push({
                initialPlannedDate: {
                    ...(query.plannedFrom ? { gte: new Date(query.plannedFrom) } : {}),
                    ...(query.plannedTo ? { lte: new Date(query.plannedTo) } : {}),
                },
            });
        }
        const where = extraFilters.length > 0
            ? { AND: [scopeFilter, ...extraFilters] }
            : scopeFilter;
        const [data, total] = await Promise.all([
            this.prisma.task.findMany({
                where,
                orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
                include: TASK_WITH_OCCURRENCES,
                skip,
                take: limit,
            }),
            this.prisma.task.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async detail(currentUserId, taskId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: TASK_WITH_OCCURRENCES,
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.assignerId !== currentUserId &&
            task.assigneeId !== currentUserId) {
            const user = await this.prisma.user.findUnique({
                where: { id: currentUserId },
                include: { role: { select: { name: true } } },
            });
            if (user?.role?.name !== permissions_catalog_1.SUPER_ADMIN_ROLE) {
                throw new common_1.ForbiddenException('Not allowed to view this task');
            }
        }
        return task;
    }
    async update(currentUserId, taskId, dto) {
        const task = await this.prisma.task.findUnique({ where: { id: taskId } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.assignerId !== currentUserId) {
            throw new common_1.ForbiddenException('Only the assigner can edit a task');
        }
        return this.prisma.task.update({
            where: { id: taskId },
            data: {
                title: dto.title,
                description: dto.description,
                priority: dto.priority,
                status: dto.status,
                recurrenceEndDate: dto.recurrenceEndDate
                    ? (0, recurrence_util_1.startOfUtcDay)(new Date(dto.recurrenceEndDate))
                    : undefined,
            },
            include: TASK_WITH_OCCURRENCES,
        });
    }
    async close(currentUserId, taskId) {
        const task = await this.prisma.task.findUnique({ where: { id: taskId } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.assignerId !== currentUserId) {
            throw new common_1.ForbiddenException('Only the assigner can close a task');
        }
        return this.prisma.task.update({
            where: { id: taskId },
            data: { status: client_1.TaskStatus.closed },
            include: TASK_WITH_OCCURRENCES,
        });
    }
    async markInProgress(currentUserId, taskId) {
        const task = await this.prisma.task.findUnique({ where: { id: taskId } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.assigneeId !== currentUserId) {
            throw new common_1.ForbiddenException('Only the assignee can mark a task in progress');
        }
        if (task.status !== client_1.TaskStatus.open &&
            task.status !== client_1.TaskStatus.reopened) {
            throw new common_1.BadRequestException('Task can only be moved to in-progress from open or reopened');
        }
        return this.prisma.task.update({
            where: { id: taskId },
            data: { status: client_1.TaskStatus.in_progress },
            include: TASK_WITH_OCCURRENCES,
        });
    }
    async resolveOccurrence(currentUserId, occurrenceId, dto) {
        const occurrence = await this.prisma.taskOccurrence.findUnique({
            where: { id: occurrenceId },
            include: { task: true },
        });
        if (!occurrence)
            throw new common_1.NotFoundException('Occurrence not found');
        if (occurrence.task.assigneeId !== currentUserId) {
            throw new common_1.ForbiddenException('Only the assignee can resolve an occurrence');
        }
        if (occurrence.status === client_1.OccurrenceStatus.resolved) {
            throw new common_1.BadRequestException('Occurrence already resolved');
        }
        const now = new Date();
        const effectivePlanned = occurrence.extendedDate ?? occurrence.plannedDate;
        const delay = Math.max(0, (0, recurrence_util_1.diffInDays)(now, effectivePlanned));
        const updated = await this.prisma.taskOccurrence.update({
            where: { id: occurrenceId },
            data: {
                status: client_1.OccurrenceStatus.resolved,
                actualDate: now,
                delayDays: delay,
                resolvedNote: dto.note,
            },
        });
        if (occurrence.task.frequency === client_1.TaskFrequency.none) {
            const pendingLeft = await this.prisma.taskOccurrence.count({
                where: {
                    taskId: occurrence.taskId,
                    status: { in: [client_1.OccurrenceStatus.pending, client_1.OccurrenceStatus.reopened] },
                },
            });
            if (pendingLeft === 0 && occurrence.task.status !== client_1.TaskStatus.closed) {
                await this.prisma.task.update({
                    where: { id: occurrence.taskId },
                    data: { status: client_1.TaskStatus.resolved },
                });
            }
        }
        return updated;
    }
    async reopenOccurrence(currentUserId, occurrenceId) {
        const occurrence = await this.prisma.taskOccurrence.findUnique({
            where: { id: occurrenceId },
            include: { task: true },
        });
        if (!occurrence)
            throw new common_1.NotFoundException('Occurrence not found');
        if (occurrence.task.assignerId !== currentUserId) {
            throw new common_1.ForbiddenException('Only the assigner can reopen an occurrence');
        }
        if (occurrence.task.status === client_1.TaskStatus.resolved) {
            await this.prisma.task.update({
                where: { id: occurrence.taskId },
                data: { status: client_1.TaskStatus.reopened },
            });
        }
        return this.prisma.taskOccurrence.update({
            where: { id: occurrenceId },
            data: {
                status: client_1.OccurrenceStatus.reopened,
                actualDate: null,
                delayDays: null,
                resolvedNote: null,
            },
        });
    }
    async requestExtension(currentUserId, occurrenceId, dto) {
        const occurrence = await this.prisma.taskOccurrence.findUnique({
            where: { id: occurrenceId },
            include: { task: true },
        });
        if (!occurrence)
            throw new common_1.NotFoundException('Occurrence not found');
        if (occurrence.task.assigneeId !== currentUserId) {
            throw new common_1.ForbiddenException('Only the assignee can request an extension');
        }
        if (occurrence.status === client_1.OccurrenceStatus.resolved) {
            throw new common_1.BadRequestException('Cannot extend a resolved occurrence');
        }
        const requestedDate = (0, recurrence_util_1.startOfUtcDay)(new Date(dto.requestedDate));
        const currentTarget = occurrence.extendedDate ?? occurrence.plannedDate;
        if (requestedDate <= currentTarget) {
            throw new common_1.BadRequestException('Requested date must be after the current planned date');
        }
        return this.prisma.taskExtensionRequest.create({
            data: {
                occurrenceId,
                requestedById: currentUserId,
                requestedDate,
                reason: dto.reason,
            },
            include: {
                requestedBy: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async decideExtension(currentUserId, extensionId, dto) {
        const extension = await this.prisma.taskExtensionRequest.findUnique({
            where: { id: extensionId },
            include: { occurrence: { include: { task: true } } },
        });
        if (!extension)
            throw new common_1.NotFoundException('Extension request not found');
        if (extension.occurrence.task.assignerId !== currentUserId) {
            throw new common_1.ForbiddenException('Only the assigner can decide an extension request');
        }
        if (extension.status !== client_1.ExtensionStatus.pending) {
            throw new common_1.BadRequestException('Extension already decided');
        }
        const now = new Date();
        if (dto.action === 'reject') {
            return this.prisma.taskExtensionRequest.update({
                where: { id: extensionId },
                data: {
                    status: client_1.ExtensionStatus.rejected,
                    decidedById: currentUserId,
                    decidedAt: now,
                    decisionNote: dto.decisionNote,
                },
            });
        }
        const finalDate = (0, recurrence_util_1.startOfUtcDay)(new Date(dto.overrideDate ?? extension.requestedDate));
        const currentTarget = extension.occurrence.extendedDate ?? extension.occurrence.plannedDate;
        if (finalDate <= currentTarget) {
            throw new common_1.BadRequestException('Approved date must be after the current planned date');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.taskOccurrence.update({
                where: { id: extension.occurrenceId },
                data: { extendedDate: finalDate },
            });
            return tx.taskExtensionRequest.update({
                where: { id: extensionId },
                data: {
                    status: client_1.ExtensionStatus.approved,
                    decidedById: currentUserId,
                    decidedDate: finalDate,
                    decidedAt: now,
                    decisionNote: dto.decisionNote,
                },
                include: {
                    requestedBy: { select: { id: true, name: true, email: true } },
                    decidedBy: { select: { id: true, name: true, email: true } },
                },
            });
        });
    }
    async occurrencesDueToday(currentUserId, limit = 10) {
        const today = (0, recurrence_util_1.startOfUtcDay)(new Date());
        today.setUTCDate(today.getUTCDate() + 1);
        const items = await this.prisma.taskOccurrence.findMany({
            where: {
                task: { assigneeId: currentUserId },
                status: { in: [client_1.OccurrenceStatus.pending, client_1.OccurrenceStatus.reopened] },
                OR: [
                    { extendedDate: { lt: today } },
                    {
                        AND: [{ extendedDate: null }, { plannedDate: { lt: today } }],
                    },
                ],
            },
            include: {
                task: {
                    select: {
                        id: true,
                        title: true,
                        priority: true,
                        assigner: { select: { id: true, name: true, email: true } },
                    },
                },
            },
            orderBy: [{ task: { priority: 'desc' } }, { plannedDate: 'asc' }],
            take: limit,
        });
        return items;
    }
    async materializeRecurringOccurrences(now = new Date()) {
        const horizon = (0, recurrence_util_1.startOfUtcDay)(now);
        const tasks = await this.prisma.task.findMany({
            where: {
                frequency: { not: client_1.TaskFrequency.none },
                status: {
                    in: [client_1.TaskStatus.open, client_1.TaskStatus.in_progress, client_1.TaskStatus.reopened],
                },
                OR: [
                    { recurrenceEndDate: null },
                    { recurrenceEndDate: { gte: horizon } },
                ],
            },
        });
        let created = 0;
        for (const task of tasks) {
            try {
                const cursor = (0, recurrence_util_1.startOfUtcDay)(task.lastGeneratedThrough ?? task.initialPlannedDate);
                const cap = task.recurrenceEndDate
                    ? (0, recurrence_util_1.startOfUtcDay)(task.recurrenceEndDate)
                    : horizon;
                let next = (0, recurrence_util_1.addPeriod)(cursor, task.frequency);
                let lastCreated = null;
                while (next <= horizon && next <= cap) {
                    await this.prisma.taskOccurrence.upsert({
                        where: {
                            taskId_plannedDate: { taskId: task.id, plannedDate: next },
                        },
                        update: {},
                        create: {
                            taskId: task.id,
                            plannedDate: next,
                            status: client_1.OccurrenceStatus.pending,
                        },
                    });
                    created += 1;
                    lastCreated = next;
                    next = (0, recurrence_util_1.addPeriod)(next, task.frequency);
                }
                if (lastCreated) {
                    await this.prisma.task.update({
                        where: { id: task.id },
                        data: { lastGeneratedThrough: lastCreated },
                    });
                }
            }
            catch (err) {
                this.logger.error(`Failed to materialize occurrences for task ${task.id}`, err);
            }
        }
        return created;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map