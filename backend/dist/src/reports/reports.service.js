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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const recurrence_util_1 = require("../tasks/recurrence.util");
const permissions_catalog_1 = require("../permissions/permissions.catalog");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async doerPerformance(currentUserId, query) {
        const me = await this.prisma.user.findUnique({
            where: { id: currentUserId },
            include: { role: { select: { name: true } } },
        });
        const isAdmin = me?.role?.name === permissions_catalog_1.SUPER_ADMIN_ROLE;
        const from = query.from ? (0, recurrence_util_1.startOfUtcDay)(new Date(query.from)) : undefined;
        const to = query.to ? (0, recurrence_util_1.startOfUtcDay)(new Date(query.to)) : undefined;
        if (to) {
            to.setUTCDate(to.getUTCDate() + 1);
        }
        const dateFilter = {};
        if (from || to) {
            dateFilter.plannedDate = {
                ...(from ? { gte: from } : {}),
                ...(to ? { lt: to } : {}),
            };
        }
        const taskFilter = isAdmin
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
        const buckets = new Map();
        for (const occ of occurrences) {
            const a = occ.task.assignee;
            if (!a)
                continue;
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
            if (occ.status === client_1.OccurrenceStatus.resolved) {
                row.resolvedCount += 1;
                const delay = occ.delayDays ?? 0;
                if (delay === 0)
                    row.onTimeCount += 1;
                else {
                    row.delayedCount += 1;
                    row.avgDelayDays += delay;
                    if (delay > row.maxDelayDays)
                        row.maxDelayDays = delay;
                }
            }
            else {
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map