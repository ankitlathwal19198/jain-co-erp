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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const permissions_catalog_1 = require("../permissions/permissions.catalog");
let SeedService = SeedService_1 = class SeedService {
    prisma;
    logger = new common_1.Logger(SeedService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        try {
            await this.seedPermissions();
            const superAdminId = await this.seedSuperAdminRole();
            await this.seedMemberRole();
            await this.seedSuperAdminUsers(superAdminId);
            this.logger.log('RBAC seed bootstrap finished');
        }
        catch (err) {
            this.logger.error('RBAC seed bootstrap failed', err);
        }
    }
    async seedPermissions() {
        await Promise.all(permissions_catalog_1.PERMISSION_CATALOG.map((p) => this.prisma.permission.upsert({
            where: { code: p.code },
            update: {
                module: p.module,
                action: p.action,
                description: p.description,
            },
            create: p,
        })));
    }
    async seedSuperAdminRole() {
        const role = await this.prisma.role.upsert({
            where: { name: permissions_catalog_1.SUPER_ADMIN_ROLE },
            update: { isSystem: true },
            create: {
                name: permissions_catalog_1.SUPER_ADMIN_ROLE,
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
    async seedMemberRole() {
        await this.prisma.role.upsert({
            where: { name: permissions_catalog_1.MEMBER_ROLE },
            update: { isSystem: true },
            create: {
                name: permissions_catalog_1.MEMBER_ROLE,
                description: 'Default role for newly created users (dashboard view only)',
                isSystem: true,
            },
        });
    }
    async seedSuperAdminUsers(superAdminRoleId) {
        for (const u of permissions_catalog_1.SEED_USERS) {
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
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeedService);
//# sourceMappingURL=seed.service.js.map