import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import {
  MEMBER_ROLE,
  PERMISSION_CATALOG,
  SEED_USERS,
  SUPER_ADMIN_ROLE,
} from '../permissions/permissions.catalog';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.seedPermissions();
      const superAdminId = await this.seedSuperAdminRole();
      await this.seedMemberRole();
      await this.seedSuperAdminUsers(superAdminId);
      this.logger.log('RBAC seed bootstrap finished');
    } catch (err) {
      this.logger.error('RBAC seed bootstrap failed', err as Error);
    }
  }

  private async seedPermissions(): Promise<void> {
    await Promise.all(
      PERMISSION_CATALOG.map((p) =>
        this.prisma.permission.upsert({
          where: { code: p.code },
          update: {
            module: p.module,
            action: p.action,
            description: p.description,
          },
          create: p,
        }),
      ),
    );
  }

  private async seedSuperAdminRole(): Promise<string> {
    const role = await this.prisma.role.upsert({
      where: { name: SUPER_ADMIN_ROLE },
      update: { isSystem: true },
      create: {
        name: SUPER_ADMIN_ROLE,
        description: 'Full unrestricted access to every module and action',
        isSystem: true,
      },
    });

    const allPerms = await this.prisma.permission.findMany({
      select: { id: true },
    });

    await this.prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    if (allPerms.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: allPerms.map((p) => ({ roleId: role.id, permissionId: p.id })),
        skipDuplicates: true,
      });
    }

    return role.id;
  }

  private async seedMemberRole(): Promise<void> {
    await this.prisma.role.upsert({
      where: { name: MEMBER_ROLE },
      update: { isSystem: true },
      create: {
        name: MEMBER_ROLE,
        description: 'Default role for newly created users (dashboard view only)',
        isSystem: true,
      },
    });
  }

  private async seedSuperAdminUsers(superAdminRoleId: string): Promise<void> {
    for (const u of SEED_USERS) {
      const existing = await this.prisma.user.findUnique({
        where: { email: u.email },
        select: { id: true, roleId: true },
      });

      if (existing) {
        if (existing.roleId !== superAdminRoleId) {
          await this.prisma.user.update({
            where: { id: existing.id },
            data: { roleId: superAdminRoleId },
          });
          this.logger.log(`Promoted ${u.email} to SuperAdmin`);
        }
        continue;
      }

      const hashed = await bcrypt.hash(u.password, 12);
      await this.prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          password: hashed,
          roleId: superAdminRoleId,
        },
      });
      this.logger.log(`Created SuperAdmin user ${u.email}`);
    }
  }
}
