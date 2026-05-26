import { Injectable } from '@nestjs/common';
import { OccurrenceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { startOfUtcDay } from '../tasks/recurrence.util';
import { DoerReportQueryDto } from './dto/doer-report-query.dto';
import { SUPER_ADMIN_ROLE } from '../permissions/permissions.catalog';

export interface DoerRow {
  assigneeId: string;
  name: string | null;
  email: string;
  designation: string | null;
  totalOccurrences: number;
  resolvedCount: number;
  pendingCount: number;
  onTimeCount: number;
  delayedCount: number;
  avgDelayDays: number;
  maxDelayDays: number;
  completionRate: number;
  onTimeRate: number;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async doerPerformance(
    currentUserId: string,
    query: DoerReportQueryDto,
  ): Promise<DoerRow[]> {
    const me = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      include: { role: { select: { name: true } } },
    });
    const isAdmin = me?.role?.name === SUPER_ADMIN_ROLE;

    const from = query.from ? startOfUtcDay(new Date(query.from)) : undefined;
    const to = query.to ? startOfUtcDay(new Date(query.to)) : undefined;
    if (to) {
      to.setUTCDate(to.getUTCDate() + 1);
    }

    const dateFilter: Prisma.TaskOccurrenceWhereInput = {};
    if (from || to) {
      dateFilter.plannedDate = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lt: to } : {}),
      };
    }

    const taskFilter: Prisma.TaskWhereInput = isAdmin
      ? {}
      : { assignerId: currentUserId };

    if (query.assigneeId) {
      taskFilter.assigneeId = query.assigneeId;
    }

    const occurrences = await this.prisma.taskOccurrence.findMany({
      where: {
        ...dateFilter,
        task: taskFilter,
      },
      include: {
        task: {
          select: {
            assigneeId: true,
            assignee: {
              select: { id: true, name: true, email: true, designation: true },
            },
          },
        },
      },
    });

    const buckets = new Map<string, DoerRow>();
    for (const occ of occurrences) {
      const a = occ.task.assignee;
      if (!a) continue;
      let row = buckets.get(a.id);
      if (!row) {
        row = {
          assigneeId: a.id,
          name: a.name,
          email: a.email,
          designation: a.designation,
          totalOccurrences: 0,
          resolvedCount: 0,
          pendingCount: 0,
          onTimeCount: 0,
          delayedCount: 0,
          avgDelayDays: 0,
          maxDelayDays: 0,
          completionRate: 0,
          onTimeRate: 0,
        };
        buckets.set(a.id, row);
      }
      row.totalOccurrences += 1;
      if (occ.status === OccurrenceStatus.resolved) {
        row.resolvedCount += 1;
        const delay = occ.delayDays ?? 0;
        if (delay === 0) row.onTimeCount += 1;
        else {
          row.delayedCount += 1;
          row.avgDelayDays += delay;
          if (delay > row.maxDelayDays) row.maxDelayDays = delay;
        }
      } else {
        row.pendingCount += 1;
      }
    }

    const rows = Array.from(buckets.values()).map((r) => ({
      ...r,
      avgDelayDays: r.delayedCount ? r.avgDelayDays / r.delayedCount : 0,
      completionRate: r.totalOccurrences
        ? r.resolvedCount / r.totalOccurrences
        : 0,
      onTimeRate: r.resolvedCount ? r.onTimeCount / r.resolvedCount : 0,
    }));

    rows.sort((a, b) => b.totalOccurrences - a.totalOccurrences);
    return rows;
  }
}
