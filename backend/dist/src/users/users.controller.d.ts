import type { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    lookup(req: Request): Promise<import("./users.service").LookupUser[]>;
    nextEmpId(): Promise<{
        empId: string;
    }>;
    list(): Promise<import("./users.service").UserWithRole[]>;
    detail(id: string): Promise<import("./users.service").UserWithRole>;
    create(dto: CreateUserDto): Promise<import("./users.service").UserWithRole>;
    update(id: string, dto: UpdateUserDto): Promise<import("./users.service").UserWithRole>;
    remove(req: Request, id: string): Promise<{
        id: string;
    }>;
}
