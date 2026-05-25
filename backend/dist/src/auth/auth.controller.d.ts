import type { Request, Response } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: CreateUserDto): Promise<import("../users/users.service").SafeUser>;
    login(dto: LoginDto, res: Response): Promise<{
        message: string;
    }>;
    logout(res: Response): {
        message: string;
    };
    me(req: Request): unknown;
}
