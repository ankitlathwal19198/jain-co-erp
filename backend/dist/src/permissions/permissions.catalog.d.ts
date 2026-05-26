export interface PermissionDef {
    code: string;
    module: string;
    action: string;
    description: string;
}
export declare const SUPER_ADMIN_ROLE = "SuperAdmin";
export declare const MEMBER_ROLE = "Member";
export declare const PERMISSIONS: {
    readonly USERS_VIEW: "users:view";
    readonly USERS_CREATE: "users:create";
    readonly USERS_UPDATE: "users:update";
    readonly USERS_DELETE: "users:delete";
    readonly ROLES_VIEW: "roles:view";
    readonly ROLES_CREATE: "roles:create";
    readonly ROLES_UPDATE: "roles:update";
    readonly ROLES_DELETE: "roles:delete";
    readonly ROLES_ASSIGN: "roles:assign";
    readonly TASKS_VIEW: "tasks:view";
    readonly TASKS_VIEW_ALL: "tasks:view_all";
    readonly TASKS_CREATE: "tasks:create";
    readonly TASKS_UPDATE: "tasks:update";
    readonly TASKS_DELETE: "tasks:delete";
    readonly TASKS_RESOLVE: "tasks:resolve";
    readonly TASKS_EXTEND: "tasks:extend";
    readonly TASKS_APPROVE_EXTENSION: "tasks:approve_extension";
    readonly REPORTS_VIEW: "reports:view";
    readonly REPORTS_EXPORT: "reports:export";
};
export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export declare const PERMISSION_CATALOG: PermissionDef[];
export declare const SEED_USERS: {
    email: string;
    name: string;
    password: string;
}[];
