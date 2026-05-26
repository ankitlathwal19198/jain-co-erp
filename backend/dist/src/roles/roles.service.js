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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const permissions_catalog_1 = require("../permissions/permissions.catalog");
let RolesService = class RolesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
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
    async detail(id) {
        const r = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: { include: { permission: true } },
                _count: { select: { users: true } },
            },
        });
        if (!r)
            throw new common_1.NotFoundException('Role not found');
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
    async create(dto) {
        const existing = await this.prisma.role.findUnique({ where: { name: dto.name } });
        if (existing)
            throw new common_1.ConflictException('Role name already exists');
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
    async update(id, dto) {
        const existing = await this.prisma.role.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Role not found');
        if (existing.isSystem && existing.name === permissions_catalog_1.SUPER_ADMIN_ROLE) {
            throw new common_1.BadRequestException('Cannot modify the SuperAdmin role');
        }
        if (dto.name && dto.name !== existing.name) {
            const dup = await this.prisma.role.findUnique({ where: { name: dto.name } });
            if (dup)
                throw new common_1.ConflictException('Role name already exists');
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
    async remove(id) {
        const existing = await this.prisma.role.findUnique({
            where: { id },
            include: { _count: { select: { users: true } } },
        });
        if (!existing)
            throw new common_1.NotFoundException('Role not found');
        if (existing.isSystem) {
            throw new common_1.BadRequestException('System roles cannot be deleted');
        }
        if (existing._count.users > 0) {
            throw new common_1.ConflictException('Role is assigned to users; reassign them before deleting');
        }
        await this.prisma.role.delete({ where: { id } });
        return { id };
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map