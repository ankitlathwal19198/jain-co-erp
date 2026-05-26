"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEED_USERS = exports.PERMISSION_CATALOG = exports.PERMISSIONS = exports.MEMBER_ROLE = exports.SUPER_ADMIN_ROLE = void 0;
exports.SUPER_ADMIN_ROLE = 'SuperAdmin';
exports.MEMBER_ROLE = 'Member';
exports.PERMISSIONS = {
    USERS_VIEW: 'users:view',
    USERS_CREATE: 'users:create',
    USERS_UPDATE: 'users:update',
    USERS_DELETE: 'users:delete',
    ROLES_VIEW: 'roles:view',
    ROLES_CREATE: 'roles:create',
    ROLES_UPDATE: 'roles:update',
    ROLES_DELETE: 'roles:delete',
    ROLES_ASSIGN: 'roles:assign',
    TASKS_VIEW: 'tasks:view',
    TASKS_VIEW_ALL: 'tasks:view_all',
    TASKS_CREATE: 'tasks:create',
    TASKS_UPDATE: 'tasks:update',
    TASKS_DELETE: 'tasks:delete',
    TASKS_RESOLVE: 'tasks:resolve',
    TASKS_EXTEND: 'tasks:extend',
    TASKS_APPROVE_EXTENSION: 'tasks:approve_extension',
    REPORTS_VIEW: 'reports:view',
    REPORTS_EXPORT: 'reports:export',
};
exports.PERMISSION_CATALOG = [
    { code: exports.PERMISSIONS.USERS_VIEW, module: 'users', action: 'view', description: 'View users list and details' },
    { code: exports.PERMISSIONS.USERS_CREATE, module: 'users', action: 'create', description: 'Create new users' },
    { code: exports.PERMISSIONS.USERS_UPDATE, module: 'users', action: 'update', description: 'Edit user profile and role' },
    { code: exports.PERMISSIONS.USERS_DELETE, module: 'users', action: 'delete', description: 'Delete users' },
    { code: exports.PERMISSIONS.ROLES_VIEW, module: 'roles', action: 'view', description: 'View roles and permissions' },
    { code: exports.PERMISSIONS.ROLES_CREATE, module: 'roles', action: 'create', description: 'Create new roles' },
    { code: exports.PERMISSIONS.ROLES_UPDATE, module: 'roles', action: 'update', description: 'Edit role permissions' },
    { code: exports.PERMISSIONS.ROLES_DELETE, module: 'roles', action: 'delete', description: 'Delete roles' },
    { code: exports.PERMISSIONS.ROLES_ASSIGN, module: 'roles', action: 'assign', description: 'Assign roles to users' },
    { code: exports.PERMISSIONS.TASKS_VIEW, module: 'tasks', action: 'view', description: 'View own tasks (assigned to or by me)' },
    { code: exports.PERMISSIONS.TASKS_VIEW_ALL, module: 'tasks', action: 'view_all', description: 'View every task across the system' },
    { code: exports.PERMISSIONS.TASKS_CREATE, module: 'tasks', action: 'create', description: 'Create tasks' },
    { code: exports.PERMISSIONS.TASKS_UPDATE, module: 'tasks', action: 'update', description: 'Update tasks' },
    { code: exports.PERMISSIONS.TASKS_DELETE, module: 'tasks', action: 'delete', description: 'Close/delete tasks' },
    { code: exports.PERMISSIONS.TASKS_RESOLVE, module: 'tasks', action: 'resolve', description: 'Resolve task occurrences' },
    { code: exports.PERMISSIONS.TASKS_EXTEND, module: 'tasks', action: 'extend', description: 'Request task extensions' },
    { code: exports.PERMISSIONS.TASKS_APPROVE_EXTENSION, module: 'tasks', action: 'approve_extension', description: 'Approve / reject extension requests' },
    { code: exports.PERMISSIONS.REPORTS_VIEW, module: 'reports', action: 'view', description: 'View reports' },
    { code: exports.PERMISSIONS.REPORTS_EXPORT, module: 'reports', action: 'export', description: 'Export reports to file' },
];
exports.SEED_USERS = [
    { email: 'hemant@gmail.com', name: 'Hemant Paliwal', password: 'superadmin@1234' },
    { email: 'ankit@gmail.com', name: 'Ankit', password: 'superadmin@1234' },
];
//# sourceMappingURL=permissions.catalog.js.map