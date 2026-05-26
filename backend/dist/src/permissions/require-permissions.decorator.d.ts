import type { PermissionCode } from './permissions.catalog';
export declare const PERMISSIONS_KEY = "required_permissions";
export declare const RequirePermissions: (...permissions: PermissionCode[]) => import("@nestjs/common").CustomDecorator<string>;
