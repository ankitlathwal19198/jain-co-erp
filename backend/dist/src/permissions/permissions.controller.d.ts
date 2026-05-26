import { PermissionsService } from './permissions.service';
export declare class PermissionsController {
    private readonly permissions;
    constructor(permissions: PermissionsService);
    listGrouped(): Promise<import("./permissions.service").PermissionModuleGroup[]>;
}
