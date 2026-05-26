import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(dto: CreateUserDto): Promise<import("../users/users.service").UserWithRole>;
    login(dto: LoginDto): Promise<TokenPair>;
    issueTokens(payload: JwtPayload): TokenPair;
    verifyRefresh(token: string): Promise<JwtPayload>;
}
