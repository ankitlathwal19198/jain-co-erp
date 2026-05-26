import { PrismaService } from '../prisma/prisma.service';
import { DoerReportQueryDto } from './dto/doer-report-query.dto';
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
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    doerPerformance(currentUserId: string, query: DoerReportQueryDto): Promise<DoerRow[]>;
}
