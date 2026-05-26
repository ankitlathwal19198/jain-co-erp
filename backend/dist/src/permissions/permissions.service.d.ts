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
export declare class PermissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listGrouped(): Promise<PermissionModuleGroup[]>;
}
