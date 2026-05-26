import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PermissionDto {
  id: string;
  code: string;
  module: string;
  action: string;
  description: string | null;
}

export interface PermissionModuleGroup {
  module: string;
  permissions: PermissionDto[];
}

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async listGrouped(): Promise<PermissionModuleGroup[]> {
    const rows = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
    const map = new Map<string, PermissionDto[]>();
    for (const r of rows) {
      const bucket = map.get(r.module) ?? [];
      bucket.push({
        id: r.id,
        code: r.code,
        module: r.module,
        action: r.action,
        description: r.description,
      });
      map.set(r.module, bucket);
    }
    return Array.from(map.entries()).map(([module, permissions]) => ({
      module,
      permissions,
    }));
  }
}
