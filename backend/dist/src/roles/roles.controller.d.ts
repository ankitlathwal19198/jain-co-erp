import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';
export declare class RolesController {
    private readonly roles;
    constructor(roles: RolesService);
    list(): Promise<import("./roles.service").RoleWithPermissions[]>;
    detail(id: string): Promise<import("./roles.service").RoleWithPermissions>;
    create(dto: CreateRoleDto): Promise<import("./roles.service").RoleWithPermissions>;
    update(id: string, dto: UpdateRoleDto): Promise<import("./roles.service").RoleWithPermissions>;
    remove(id: string): Promise<{
        id: string;
    }>;
}
