"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const permissions_catalog_1 = require("../permissions/permissions.catalog");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async nextEmpId() {
        const rows = await this.prisma.user.findMany({
            where: { empId: { startsWith: 'EMP-' } },
            select: { empId: true },
        });
        let max = 0;
        for (const r of rows) {
            const m = /^EMP-(\d+)$/.exec(r.empId ?? '');
            if (m) {
                const n = parseInt(m[1], 10);
                if (n > max)
                    max = n;
            }
        }
        return `EMP-${String(max + 1).padStart(3, '0')}`;
    }
    async create(dto) {
        const empId = dto.empId?.trim() || (await this.nextEmpId());
        const orFilters = [
            { email: dto.email },
            { empId },
        ];
        const exists = await this.prisma.user.findFirst({ where: { OR: orFilters } });
        if (exists) {
            throw new common_1.ConflictException('User with this email or employee ID already exists');
        }
        let roleId = dto.roleId ?? null;
        if (!roleId) {
            const member = await this.prisma.role.findUnique({
                where: { name: permissions_catalog_1.MEMBER_ROLE },
                select: { id: true },
            });
            roleId = member?.id ?? null;
        }
        else {
            const role = await this.prisma.role.findUnique({ where: { id: roleId } });
            if (!role)
                throw new common_1.NotFoundException('Role not found');
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
    async update(id, dto) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('User not found');
        if (dto.email && dto.email !== existing.email) {
            const dup = await this.prisma.user.findUnique({ where: { email: dto.email } });
            if (dup)
                throw new common_1.ConflictException('Email already in use');
        }
        if (dto.roleId) {
            const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
            if (!role)
                throw new common_1.NotFoundException('Role not found');
        }
        const { password, ...rest } = dto;
        const data = { ...rest };
        if (password)
            data.password = await bcrypt.hash(password, 12);
        const updated = await this.prisma.user.update({
            where: { id },
            data,
            include: { role: true },
        });
        const { password: _pw, ...safe } = updated;
        return safe;
    }
    async remove(id, currentUserId) {
        if (id === currentUserId) {
            throw new common_1.ConflictException('Cannot delete your own account');
        }
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('User not found');
        await this.prisma.user.delete({ where: { id } });
        return { id };
    }
    async listAll() {
        const users = await this.prisma.user.findMany({
            include: { role: true },
            orderBy: [{ createdAt: 'desc' }],
        });
        return users.map(({ password: _pw, ...rest }) => rest);
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { role: { select: { id: true, name: true } } },
        });
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { role: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const { password: _pw, ...safe } = user;
        return safe;
    }
    async loadAuthenticated(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                role: {
                    include: { permissions: { include: { permission: true } } },
                },
            },
        });
        if (!user)
            return null;
        const roleName = user.role?.name ?? null;
        const permissions = user.role?.permissions.map((rp) => rp.permission.code) ?? [];
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            roleId: user.roleId,
            roleName,
            permissions,
            isSuperAdmin: roleName === permissions_catalog_1.SUPER_ADMIN_ROLE,
        };
    }
    async lookupAssignable(currentUserId) {
        const me = await this.prisma.user.findUnique({
            where: { id: currentUserId },
            include: { role: true },
        });
        if (!me)
            throw new common_1.NotFoundException('User not found');
        const select = {
            id: true,
            name: true,
            email: true,
            designation: true,
            role: { select: { name: true } },
        };
        const isPrivileged = me.role?.name === permissions_catalog_1.SUPER_ADMIN_ROLE;
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map