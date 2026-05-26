export interface PermissionDef {
  code: string;
  module: string;
  action: string;
  description: string;
}

export const SUPER_ADMIN_ROLE = 'SuperAdmin';
export const MEMBER_ROLE = 'Member';

export const PERMISSIONS = {
  // Users
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  // Roles
  ROLES_VIEW: 'roles:view',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  ROLES_ASSIGN: 'roles:assign',
  // Tasks
  TASKS_VIEW: 'tasks:view',
  TASKS_VIEW_ALL: 'tasks:view_all',
  TASKS_CREATE: 'tasks:create',
  TASKS_UPDATE: 'tasks:update',
  TASKS_DELETE: 'tasks:delete',
  TASKS_RESOLVE: 'tasks:resolve',
  TASKS_EXTEND: 'tasks:extend',
  TASKS_APPROVE_EXTENSION: 'tasks:approve_extension',
  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_CATALOG: PermissionDef[] = [
  { code: PERMISSIONS.USERS_VIEW, module: 'users', action: 'view', description: 'View users list and details' },
  { code: PERMISSIONS.USERS_CREATE, module: 'users', action: 'create', description: 'Create new users' },
  { code: PERMISSIONS.USERS_UPDATE, module: 'users', action: 'update', description: 'Edit user profile and role' },
  { code: PERMISSIONS.USERS_DELETE, module: 'users', action: 'delete', description: 'Delete users' },

  { code: PERMISSIONS.ROLES_VIEW, module: 'roles', action: 'view', description: 'View roles and permissions' },
  { code: PERMISSIONS.ROLES_CREATE, module: 'roles', action: 'create', description: 'Create new roles' },
  { code: PERMISSIONS.ROLES_UPDATE, module: 'roles', action: 'update', description: 'Edit role permissions' },
  { code: PERMISSIONS.ROLES_DELETE, module: 'roles', action: 'delete', description: 'Delete roles' },
  { code: PERMISSIONS.ROLES_ASSIGN, module: 'roles', action: 'assign', description: 'Assign roles to users' },

  { code: PERMISSIONS.TASKS_VIEW, module: 'tasks', action: 'view', description: 'View own tasks (assigned to or by me)' },
  { code: PERMISSIONS.TASKS_VIEW_ALL, module: 'tasks', action: 'view_all', description: 'View every task across the system' },
  { code: PERMISSIONS.TASKS_CREATE, module: 'tasks', action: 'create', description: 'Create tasks' },
  { code: PERMISSIONS.TASKS_UPDATE, module: 'tasks', action: 'update', description: 'Update tasks' },
  { code: PERMISSIONS.TASKS_DELETE, module: 'tasks', action: 'delete', description: 'Close/delete tasks' },
  { code: PERMISSIONS.TASKS_RESOLVE, module: 'tasks', action: 'resolve', description: 'Resolve task occurrences' },
  { code: PERMISSIONS.TASKS_EXTEND, module: 'tasks', action: 'extend', description: 'Request task extensions' },
  { code: PERMISSIONS.TASKS_APPROVE_EXTENSION, module: 'tasks', action: 'approve_extension', description: 'Approve / reject extension requests' },

  { code: PERMISSIONS.REPORTS_VIEW, module: 'reports', action: 'view', description: 'View reports' },
  { code: PERMISSIONS.REPORTS_EXPORT, module: 'reports', action: 'export', description: 'Export reports to file' },
];

export const SEED_USERS = [
  { email: 'hemant@gmail.com', name: 'Hemant Paliwal', password: 'superadmin@1234' },
  { email: 'ankit@gmail.com', name: 'Ankit', password: 'superadmin@1234' },
];
