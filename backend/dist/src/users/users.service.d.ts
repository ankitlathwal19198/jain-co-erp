import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { User } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/authenticated-user.type';
export type SafeUser = Omit<User, 'password'>;
export interface UserWithRole extends SafeUser {
    role: {
        id: string;
        name: string;
        description: string | null;
        isSystem: boolean;
    } | null;
}
export interface LookupUser {
    id: string;
    name: string | null;
    email: string;
    designation: string | null;
    roleName: string | null;
}
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    nextEmpId(): Promise<string>;
    create(dto: CreateUserDto): Promise<UserWithRole>;
    update(id: string, dto: UpdateUserDto): Promise<UserWithRole>;
    remove(id: string, currentUserId: string): Promise<{
        id: string;
    }>;
    listAll(): Promise<UserWithRole[]>;
    findByEmail(email: string): Promise<(User & {
        role: {
            id: string;
            name: string;
        } | null;
    }) | null>;
    findById(id: string): Promise<UserWithRole>;
    loadAuthenticated(id: string): Promise<AuthenticatedUser | null>;
    lookupAssignable(currentUserId: string): Promise<LookupUser[]>;
}
