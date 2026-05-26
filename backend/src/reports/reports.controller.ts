import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { RequirePermissions } from '../permissions/require-permissions.decorator';
import { PERMISSIONS } from '../permissions/permissions.catalog';
import { DoerReportQueryDto } from './dto/doer-report-query.dto';
import { ReportsService } from './reports.service';

interface AuthedUser {
  id: string;
}

@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('doer-performance')
  @RequirePermissions(PERMISSIONS.REPORTS_VIEW)
  doer(@Req() req: Request, @Query() query: DoerReportQueryDto) {
    const id = (req as Request & { user: AuthedUser }).user.id;
    return this.reports.doerPerformance(id, query);
  }
}
