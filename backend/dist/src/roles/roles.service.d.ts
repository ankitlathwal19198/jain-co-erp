import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export interface RoleWithPermissions {
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
    permissions: {
        id: string;
        code: string;
        module: string;
        action: string;
    }[];
    userCount: number;
}
export declare class RolesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Promise<RoleWithPermissions[]>;
    detail(id: string): Promise<RoleWithPermissions>;
    create(dto: CreateRoleDto): Promise<RoleWithPermissions>;
    update(id: string, dto: UpdateRoleDto): Promise<RoleWithPermissions>;
    remove(id: string): Promise<{
        id: string;
    }>;
}
