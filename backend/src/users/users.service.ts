import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { User } from '@prisma/client';
import { MEMBER_ROLE, SUPER_ADMIN_ROLE } from '../permissions/permissions.catalog';
import type { AuthenticatedUser } from '../auth/authenticated-user.type';

export type SafeUser = Omit<User, 'password'>;

export interface UserWithRole extends SafeUser {
  role: { id: string; name: string; description: string | null; isSystem: boolean } | null;
}

export interface LookupUser {
  id: string;
  name: string | null;
  email: string;
  designation: string | null;
  roleName: string | null;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async nextEmpId(): Promise<string> {
    const rows = await this.prisma.user.findMany({
      where: { empId: { startsWith: 'EMP-' } },
      select: { empId: true },
    });
    let max = 0;
    for (const r of rows) {
      const m = /^EMP-(\d+)$/.exec(r.empId ?? '');
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > max) max = n;
      }
    }
    return `EMP-${String(max + 1).padStart(3, '0')}`;
  }

  async create(dto: CreateUserDto): Promise<UserWithRole> {
    const empId = dto.empId?.trim() || (await this.nextEmpId());

    const orFilters: { email?: string; empId?: string }[] = [
      { email: dto.email },
      { empId },
    ];

    const exists = await this.prisma.user.findFirst({ where: { OR: orFilters } });
    if (exists) {
      throw new ConflictException(
        'User with this email or employee ID already exists',
      );
    }

    let roleId = dto.roleId ?? null;
    if (!roleId) {
      const member = await this.prisma.role.findUnique({
        where: { name: MEMBER_ROLE },
        select: { id: true },
      });
      roleId = member?.id ?? null;
    } else {
      const role = await this.prisma.role.findUnique({ where: { id: roleId } });
      if (!role) throw new NotFoundException('Role not found');
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    const { roleId: _ignored, password: _pw, empId: _ignoredEmp, ...rest } = dto;
    const created = await this.prisma.user.create({
      data: { ...rest, empId, password: hashed, roleId },
      include: { role: true },
    });
    const { password: _stripped, ...safe } = created;
    return safe;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserWithRole> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== existing.email) {
      const dup = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (dup) throw new ConflictException('Email already in use');
    }

    if (dto.roleId) {
      const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
      if (!role) throw new NotFoundException('Role not found');
    }

    const { password, ...rest } = dto;
    const data: Record<string, unknown> = { ...rest };
    if (password) data.password = await bcrypt.hash(password, 12);

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
    const { password: _pw, ...safe } = updated;
    return safe;
  }

  async remove(id: string, currentUserId: string): Promise<{ id: string }> {
    if (id === currentUserId) {
      throw new ConflictException('Cannot delete your own account');
    }
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
    return { id };
  }

  async listAll(): Promise<UserWithRole[]> {
    const users = await this.prisma.user.findMany({
      include: { role: true },
      orderBy: [{ createdAt: 'desc' }],
    });
    return users.map(({ password: _pw, ...rest }) => rest);
  }

  async findByEmail(email: string): Promise<(User & { role: { id: string; name: string } | null }) | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: { select: { id: true, name: true } } },
    });
  }

  async findById(id: string): Promise<UserWithRole> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { password: _pw, ...safe } = user;
    return safe;
  }

  async loadAuthenticated(id: string): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });
    if (!user) return null;

    const roleName = user.role?.name ?? null;
    const permissions = user.role?.permissions.map((rp) => rp.permission.code) ?? [];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      roleName,
      permissions,
      isSuperAdmin: roleName === SUPER_ADMIN_ROLE,
    };
  }

  async lookupAssignable(currentUserId: string): Promise<LookupUser[]> {
    const me = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      include: { role: true },
    });
    if (!me) throw new NotFoundException('User not found');

    const select = {
      id: true,
      name: true,
      email: true,
      designation: true,
      role: { select: { name: true } },
    } as const;

    const isPrivileged = me.role?.name === SUPER_ADMIN_ROLE;

    const rows = isPrivileged
      ? await this.prisma.user.findMany({
          where: { id: { not: currentUserId } },
          select,
          orderBy: [{ name: 'asc' }, { email: 'asc' }],
        })
      : await this.prisma.user.findMany({
          where: { reportingManagerId: currentUserId },
          select,
          orderBy: [{ name: 'asc' }, { email: 'asc' }],
        });

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      designation: r.designation,
      roleName: r.role?.name ?? null,
    }));
  }
}
