import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { createUserSchema } from './schemas/user.schema';
import type { User } from '@prisma/client';

export type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const parsed = createUserSchema.parse(dto);

    const orFilters: { email?: string; empId?: string }[] = [
      { email: parsed.email },
    ];
    if (parsed.empId) orFilters.push({ empId: parsed.empId });

    const exists = await this.prisma.user.findFirst({
      where: { OR: orFilters },
    });
    if (exists) {
      throw new ConflictException(
        'User with this email or employee ID already exists',
      );
    }

    const hashed = await bcrypt.hash(parsed.password, 12);
    const created = await this.prisma.user.create({
      data: { ...parsed, password: hashed },
    });

    const { password: _pw, ...safe } = created;
    return safe;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { password: _pw, ...safe } = user;
    return safe;
  }
}
