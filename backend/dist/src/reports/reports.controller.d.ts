import type { Request } from 'express';
import { DoerReportQueryDto } from './dto/doer-report-query.dto';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reports;
    constructor(reports: ReportsService);
    doer(req: Request, query: DoerReportQueryDto): Promise<import("./reports.service").DoerRow[]>;
}
