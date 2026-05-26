import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { RequirePermissions } from '../permissions/require-permissions.decorator';
import { PERMISSIONS } from '../permissions/permissions.catalog';
import { CreateExtensionDto } from './dto/create-extension.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { DecideExtensionDto } from './dto/decide-extension.dto';
import { ListTasksDto } from './dto/list-tasks.dto';
import { ResolveOccurrenceDto } from './dto/resolve-occurrence.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

interface AuthedUser {
  id: string;
  permissions: string[];
  isSuperAdmin: boolean;
}

function authedUser(req: Request): AuthedUser {
  return (req as Request & { user: AuthedUser }).user;
}

function userId(req: Request): string {
  return authedUser(req).id;
}

function canViewAll(req: Request): boolean {
  const u = authedUser(req);
  return u.isSuperAdmin || (u.permissions ?? []).includes(PERMISSIONS.TASKS_VIEW_ALL);
}

@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.TASKS_CREATE)
  create(@Req() req: Request, @Body() dto: CreateTaskDto) {
    return this.tasks.create(userId(req), dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.TASKS_VIEW)
  list(@Req() req: Request, @Query() query: ListTasksDto) {
    return this.tasks.list(userId(req), query, canViewAll(req));
  }

  @Get('occurrences/today')
  @RequirePermissions(PERMISSIONS.TASKS_VIEW)
  today(@Req() req: Request) {
    return this.tasks.occurrencesDueToday(userId(req));
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.TASKS_VIEW)
  detail(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.tasks.detail(userId(req), id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.TASKS_UPDATE)
  update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(userId(req), id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.TASKS_DELETE)
  close(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.tasks.close(userId(req), id);
  }

  @Post(':id/start')
  @RequirePermissions(PERMISSIONS.TASKS_UPDATE)
  start(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.tasks.markInProgress(userId(req), id);
  }

  @Post('occurrences/:id/resolve')
  @RequirePermissions(PERMISSIONS.TASKS_RESOLVE)
  resolve(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResolveOccurrenceDto,
  ) {
    return this.tasks.resolveOccurrence(userId(req), id, dto);
  }

  @Post('occurrences/:id/reopen')
  @RequirePermissions(PERMISSIONS.TASKS_UPDATE)
  reopen(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.tasks.reopenOccurrence(userId(req), id);
  }

  @Post('occurrences/:id/extensions')
  @RequirePermissions(PERMISSIONS.TASKS_EXTEND)
  requestExtension(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateExtensionDto,
  ) {
    return this.tasks.requestExtension(userId(req), id, dto);
  }

  @Patch('extensions/:id')
  @RequirePermissions(PERMISSIONS.TASKS_APPROVE_EXTENSION)
  decideExtension(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DecideExtensionDto,
  ) {
    return this.tasks.decideExtension(userId(req), id, dto);
  }
}
