export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string | null;
    roleId: string | null;
    roleName: string | null;
    permissions: string[];
    isSuperAdmin: boolean;
}
