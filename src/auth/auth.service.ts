import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';

import { LoginDto, CreateUserDto } from './dto';
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

      return {
        success: true,
        message: 'User created.',
        data: {
          user: userCreated,
        },
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      const userFounded = await prisma.user.findFirst({
        where: { email },
        select: { email: true, password: true, id: true },
      });

      if (!userFounded) throw new UnauthorizedException('Invalid email.');

      if (!bcrypt.compareSync(password, userFounded.password))
        throw new UnauthorizedException('Invalid password.');

      return {
        success: true,
        message: 'Login success.',
        data: {
          token: this.getJwtToken({ id: userFounded.id }),
        },
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async checkAuthStatus(user: User) {
    return {
      success: true,
      message: '',
      data: {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      },
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleErrorException(error: any) {
    // Si el error ES una excepción de Nest → relánzala
    if (error instanceof HttpException) {
      this.logger.error(error);
      throw error;
    }

    // Errores inesperados → manejar normalmente
    this.logger.fatal(`Ocurrió un error inesperado: ${error}`);
    throw new InternalServerErrorException(
      `Ocurrió un error inesperado: ${error}`,
    );
  }
}
