import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SUPER_ADMIN_ROLE } from '../permissions/permissions.catalog';

export interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions: { id: string; code: string; module: string; action: string }[];
  userCount: number;
}

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<RoleWithPermissions[]> {
    const rows = await this.prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isSystem: r.isSystem,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      userCount: r._count.users,
      permissions: r.permissions.map((rp) => ({
        id: rp.permission.id,
        code: rp.permission.code,
        module: rp.permission.module,
        action: rp.permission.action,
      })),
    }));
  }

  async detail(id: string): Promise<RoleWithPermissions> {
    const r = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });
    if (!r) throw new NotFoundException('Role not found');
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      isSystem: r.isSystem,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      userCount: r._count.users,
      permissions: r.permissions.map((rp) => ({
        id: rp.permission.id,
        code: rp.permission.code,
        module: rp.permission.module,
        action: rp.permission.action,
      })),
    };
  }

  async create(dto: CreateRoleDto): Promise<RoleWithPermissions> {
    const existing = await this.prisma.role.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Role name already exists');

    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissionIds
          ? {
              create: dto.permissionIds.map((permissionId) => ({ permissionId })),
            }
          : undefined,
      },
    });
    return this.detail(role.id);
  }

  async update(id: string, dto: UpdateRoleDto): Promise<RoleWithPermissions> {
    const existing = await this.prisma.role.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Role not found');
    if (existing.isSystem && existing.name === SUPER_ADMIN_ROLE) {
      throw new BadRequestException('Cannot modify the SuperAdmin role');
    }

    if (dto.name && dto.name !== existing.name) {
      const dup = await this.prisma.role.findUnique({ where: { name: dto.name } });
      if (dup) throw new ConflictException('Role name already exists');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.role.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
        },
      });
      if (dto.permissionIds) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        if (dto.permissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: dto.permissionIds.map((permissionId) => ({
              roleId: id,
              permissionId,
            })),
            skipDuplicates: true,
          });
        }
      }
    });

    return this.detail(id);
  }

  async remove(id: string): Promise<{ id: string }> {
    const existing = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!existing) throw new NotFoundException('Role not found');
    if (existing.isSystem) {
      throw new BadRequestException('System roles cannot be deleted');
    }
    if (existing._count.users > 0) {
      throw new ConflictException(
        'Role is assigned to users; reassign them before deleting',
      );
    }
    await this.prisma.role.delete({ where: { id } });
    return { id };
  }
}
