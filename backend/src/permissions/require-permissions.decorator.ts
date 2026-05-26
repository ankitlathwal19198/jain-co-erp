import { SetMetadata } from '@nestjs/common';
import type { PermissionCode } from './permissions.catalog';

export const PERMISSIONS_KEY = 'required_permissions';

export const RequirePermissions = (...permissions: PermissionCode[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
