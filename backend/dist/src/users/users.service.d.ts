import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { User } from '@prisma/client';
export type SafeUser = Omit<User, 'password'>;
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserDto): Promise<SafeUser>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<SafeUser>;
}
