import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';

import { LoginDto, CreateUserDto, UpdateUserDto } from './dto';
import type { JwtPayload } from './interfaces';
import { User } from 'generated/prisma/client';

@Injectable()
export class AuthService {
  private logger = new Logger();

  constructor(private jwtService: JwtService) {}

  async register(createUserDto: CreateUserDto) {
    try {
      const { email, password, ...userDto } = createUserDto;

      const emailLower = email.toLowerCase().trim();
      const passwordHashed = bcrypt.hashSync(password, 10);

      const userCreated = await prisma.user.create({
        data: {
          email: emailLower,
          password: passwordHashed,
          ...userDto,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          role: true,
        },
      });
    } catch (error) {
      this.logger.fatal(error);
      throw new InternalServerErrorException(
        'Ocurrió un error al crear la cuenta.',
      );
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await prisma.user.findFirst({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if (!user) throw new UnauthorizedException('Invalid email.');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Invalid password.');

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
