import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { RequirePermissions } from '../permissions/require-permissions.decorator';
import { PERMISSIONS } from '../permissions/permissions.catalog';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

interface AuthedUser {
  id: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('lookup')
  lookup(@Req() req: Request) {
    const currentUserId = (req as Request & { user: AuthedUser }).user.id;
    return this.users.lookupAssignable(currentUserId);
  }

  @Get('next-emp-id')
  @RequirePermissions(PERMISSIONS.USERS_CREATE)
  async nextEmpId() {
    return { empId: await this.users.nextEmpId() };
  }

  @Get()
  @RequirePermissions(PERMISSIONS.USERS_VIEW)
  list() {
    return this.users.listAll();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.USERS_VIEW)
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.findById(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.USERS_CREATE)
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.USERS_UPDATE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.users.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.USERS_DELETE)
  remove(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const currentUserId = (req as Request & { user: AuthedUser }).user.id;
    return this.users.remove(id, currentUserId);
  }
}
