import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ExtensionStatus,
  OccurrenceStatus,
  Prisma,
  TaskFrequency,
  TaskStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SUPER_ADMIN_ROLE } from '../permissions/permissions.catalog';
import { CreateExtensionDto } from './dto/create-extension.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { DecideExtensionDto } from './dto/decide-extension.dto';
import { ListTasksDto, TaskScope } from './dto/list-tasks.dto';
import { ResolveOccurrenceDto } from './dto/resolve-occurrence.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { addPeriod, diffInDays, startOfUtcDay } from './recurrence.util';

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
    orderBy: { plannedDate: 'asc' as const },
    include: {
      extensions: {
        orderBy: { createdAt: 'desc' as const },
        include: {
          requestedBy: { select: { id: true, name: true, email: true } },
          decidedBy: { select: { id: true, name: true, email: true } },
        },
      },
    },
  },
} satisfies Prisma.TaskInclude;

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async assertCanAssign(
    assignerId: string,
    assigneeId: string,
  ): Promise<void> {
    if (assignerId === assigneeId) {
      throw new BadRequestException('Cannot assign a task to yourself');
    }
    const [assigner, assignee] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: assignerId },
        include: { role: { select: { name: true } } },
      }),
      this.prisma.user.findUnique({ where: { id: assigneeId } }),
    ]);
    if (!assigner) throw new ForbiddenException('Invalid assigner');
    if (!assignee) throw new NotFoundException('Assignee not found');

    const isAdmin = assigner.role?.name === SUPER_ADMIN_ROLE;
    const isManager = assignee.reportingManagerId === assignerId;
    if (!isAdmin && !isManager) {
      throw new ForbiddenException(
        'You can only assign tasks to your direct reports',
      );
    }
  }

  async create(assignerId: string, dto: CreateTaskDto) {
    await this.assertCanAssign(assignerId, dto.assigneeId);

    const plannedDate = startOfUtcDay(new Date(dto.initialPlannedDate));
    const startDate = dto.startDate
      ? startOfUtcDay(new Date(dto.startDate))
      : null;
    const recurrenceEndDate = dto.recurrenceEndDate
      ? startOfUtcDay(new Date(dto.recurrenceEndDate))
      : null;

    if (recurrenceEndDate && recurrenceEndDate < plannedDate) {
      throw new BadRequestException(
        'recurrenceEndDate must be on/after initialPlannedDate',
      );
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
            status: OccurrenceStatus.pending,
          },
        },
      },
      include: TASK_WITH_OCCURRENCES,
    });
  }

  async list(currentUserId: string, query: ListTasksDto, viewAll = false) {
    const scope: TaskScope = query.scope ?? 'all';
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 15));
    const skip = (page - 1) * limit;

    const scopeFilter: Prisma.TaskWhereInput =
      scope === 'assigned_to_me'
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

    const extraFilters: Prisma.TaskWhereInput[] = [];

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

    const where: Prisma.TaskWhereInput =
      extraFilters.length > 0
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

  async detail(currentUserId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: TASK_WITH_OCCURRENCES,
    });
    if (!task) throw new NotFoundException('Task not found');
    if (
      task.assignerId !== currentUserId &&
      task.assigneeId !== currentUserId
    ) {
      const user = await this.prisma.user.findUnique({
        where: { id: currentUserId },
        include: { role: { select: { name: true } } },
      });
      if (user?.role?.name !== SUPER_ADMIN_ROLE) {
        throw new ForbiddenException('Not allowed to view this task');
      }
    }
    return task;
  }

  async update(currentUserId: string, taskId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.assignerId !== currentUserId) {
      throw new ForbiddenException('Only the assigner can edit a task');
    }
    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        status: dto.status,
        recurrenceEndDate: dto.recurrenceEndDate
          ? startOfUtcDay(new Date(dto.recurrenceEndDate))
          : undefined,
      },
      include: TASK_WITH_OCCURRENCES,
    });
  }

  async close(currentUserId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.assignerId !== currentUserId) {
      throw new ForbiddenException('Only the assigner can close a task');
    }
    return this.prisma.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.closed },
      include: TASK_WITH_OCCURRENCES,
    });
  }

  async markInProgress(currentUserId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.assigneeId !== currentUserId) {
      throw new ForbiddenException(
        'Only the assignee can mark a task in progress',
      );
    }
    if (
      task.status !== TaskStatus.open &&
      task.status !== TaskStatus.reopened
    ) {
      throw new BadRequestException(
        'Task can only be moved to in-progress from open or reopened',
      );
    }
    return this.prisma.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.in_progress },
      include: TASK_WITH_OCCURRENCES,
    });
  }

  async resolveOccurrence(
    currentUserId: string,
    occurrenceId: string,
    dto: ResolveOccurrenceDto,
  ) {
    const occurrence = await this.prisma.taskOccurrence.findUnique({
      where: { id: occurrenceId },
      include: { task: true },
    });
    if (!occurrence) throw new NotFoundException('Occurrence not found');
    if (occurrence.task.assigneeId !== currentUserId) {
      throw new ForbiddenException(
        'Only the assignee can resolve an occurrence',
      );
    }
    if (occurrence.status === OccurrenceStatus.resolved) {
      throw new BadRequestException('Occurrence already resolved');
    }

    const now = new Date();
    const effectivePlanned = occurrence.extendedDate ?? occurrence.plannedDate;
    const delay = Math.max(0, diffInDays(now, effectivePlanned));

    const updated = await this.prisma.taskOccurrence.update({
      where: { id: occurrenceId },
      data: {
        status: OccurrenceStatus.resolved,
        actualDate: now,
        delayDays: delay,
        resolvedNote: dto.note,
      },
    });

    if (occurrence.task.frequency === TaskFrequency.none) {
      const pendingLeft = await this.prisma.taskOccurrence.count({
        where: {
          taskId: occurrence.taskId,
          status: { in: [OccurrenceStatus.pending, OccurrenceStatus.reopened] },
        },
      });
      if (pendingLeft === 0 && occurrence.task.status !== TaskStatus.closed) {
        await this.prisma.task.update({
          where: { id: occurrence.taskId },
          data: { status: TaskStatus.resolved },
        });
      }
    }

    return updated;
  }

  async reopenOccurrence(currentUserId: string, occurrenceId: string) {
    const occurrence = await this.prisma.taskOccurrence.findUnique({
      where: { id: occurrenceId },
      include: { task: true },
    });
    if (!occurrence) throw new NotFoundException('Occurrence not found');
    if (occurrence.task.assignerId !== currentUserId) {
      throw new ForbiddenException(
        'Only the assigner can reopen an occurrence',
      );
    }
    if (occurrence.task.status === TaskStatus.resolved) {
      await this.prisma.task.update({
        where: { id: occurrence.taskId },
        data: { status: TaskStatus.reopened },
      });
    }
    return this.prisma.taskOccurrence.update({
      where: { id: occurrenceId },
      data: {
        status: OccurrenceStatus.reopened,
        actualDate: null,
        delayDays: null,
        resolvedNote: null,
      },
    });
  }

  async requestExtension(
    currentUserId: string,
    occurrenceId: string,
    dto: CreateExtensionDto,
  ) {
    const occurrence = await this.prisma.taskOccurrence.findUnique({
      where: { id: occurrenceId },
      include: { task: true },
    });
    if (!occurrence) throw new NotFoundException('Occurrence not found');
    if (occurrence.task.assigneeId !== currentUserId) {
      throw new ForbiddenException(
        'Only the assignee can request an extension',
      );
    }
    if (occurrence.status === OccurrenceStatus.resolved) {
      throw new BadRequestException('Cannot extend a resolved occurrence');
    }

    const requestedDate = startOfUtcDay(new Date(dto.requestedDate));
    const currentTarget = occurrence.extendedDate ?? occurrence.plannedDate;
    if (requestedDate <= currentTarget) {
      throw new BadRequestException(
        'Requested date must be after the current planned date',
      );
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

  async decideExtension(
    currentUserId: string,
    extensionId: string,
    dto: DecideExtensionDto,
  ) {
    const extension = await this.prisma.taskExtensionRequest.findUnique({
      where: { id: extensionId },
      include: { occurrence: { include: { task: true } } },
    });
    if (!extension) throw new NotFoundException('Extension request not found');
    if (extension.occurrence.task.assignerId !== currentUserId) {
      throw new ForbiddenException(
        'Only the assigner can decide an extension request',
      );
    }
    if (extension.status !== ExtensionStatus.pending) {
      throw new BadRequestException('Extension already decided');
    }

    const now = new Date();

    if (dto.action === 'reject') {
      return this.prisma.taskExtensionRequest.update({
        where: { id: extensionId },
        data: {
          status: ExtensionStatus.rejected,
          decidedById: currentUserId,
          decidedAt: now,
          decisionNote: dto.decisionNote,
        },
      });
    }

    const finalDate = startOfUtcDay(
      new Date(dto.overrideDate ?? extension.requestedDate),
    );
    const currentTarget =
      extension.occurrence.extendedDate ?? extension.occurrence.plannedDate;
    if (finalDate <= currentTarget) {
      throw new BadRequestException(
        'Approved date must be after the current planned date',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.taskOccurrence.update({
        where: { id: extension.occurrenceId },
        data: { extendedDate: finalDate },
      });
      return tx.taskExtensionRequest.update({
        where: { id: extensionId },
        data: {
          status: ExtensionStatus.approved,
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

  async occurrencesDueToday(currentUserId: string, limit = 10) {
    const today = startOfUtcDay(new Date());
    today.setUTCDate(today.getUTCDate() + 1);

    const items = await this.prisma.taskOccurrence.findMany({
      where: {
        task: { assigneeId: currentUserId },
        status: { in: [OccurrenceStatus.pending, OccurrenceStatus.reopened] },
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

  async materializeRecurringOccurrences(
    now: Date = new Date(),
  ): Promise<number> {
    const horizon = startOfUtcDay(now);
    const tasks = await this.prisma.task.findMany({
      where: {
        frequency: { not: TaskFrequency.none },
        status: {
          in: [TaskStatus.open, TaskStatus.in_progress, TaskStatus.reopened],
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
        const cursor = startOfUtcDay(
          task.lastGeneratedThrough ?? task.initialPlannedDate,
        );
        const cap = task.recurrenceEndDate
          ? startOfUtcDay(task.recurrenceEndDate)
          : horizon;
        let next = addPeriod(cursor, task.frequency);
        let lastCreated: Date | null = null;

        while (next <= horizon && next <= cap) {
          await this.prisma.taskOccurrence.upsert({
            where: {
              taskId_plannedDate: { taskId: task.id, plannedDate: next },
            },
            update: {},
            create: {
              taskId: task.id,
              plannedDate: next,
              status: OccurrenceStatus.pending,
            },
          });
          created += 1;
          lastCreated = next;
          next = addPeriod(next, task.frequency);
        }

        if (lastCreated) {
          await this.prisma.task.update({
            where: { id: task.id },
            data: { lastGeneratedThrough: lastCreated },
          });
        }
      } catch (err) {
        this.logger.error(
          `Failed to materialize occurrences for task ${task.id}`,
          err as Error,
        );
      }
    }
    return created;
  }
}
