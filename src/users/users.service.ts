import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { prisma } from 'src/lib/prisma';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'generated/prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(private jwtService: JwtService) {}

  private logger = new Logger();

  async findAllUsers(paginationDto: PaginationDto) {
    const { take = 10, skip = 0 } = paginationDto;

    try {
      const totalUsers = await prisma.user.count();

      const users = await prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true,
        },
        take,
        skip,
      });

      if (users.length === 0) throw new NotFoundException('Users not found.');

      return {
        success: true,
        message: 'Users founded.',
        data: {
          users,
          totalUsers,
          currentPage: Math.floor(skip / take) + 1,
          totalPages: Math.ceil(totalUsers / take),
        },
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async findOneUser(id: string) {
    try {
      const userFounded = await prisma.user.findUnique({ where: { id } });
      if (!userFounded) throw new NotFoundException('User not found.');

      return {
        success: true,
        message: 'User found.',
        data: {
          user: userFounded,
        },
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async updateUser(
    request: Express.Request,
    id: string,
    updateUserDto: UpdateUserDto,
  ) {
    try {
      const user = request.user as User;
      console.log({ user });
      const userFounded = await prisma.user.findUnique({ where: { id } });
      if (!userFounded) throw new NotFoundException('User not found.');

      if (user.role !== 'admin' && user.id !== id)
        throw new UnauthorizedException(
          "You don't have permission to update a user that isn't yours.",
        );

      await prisma.user.update({ where: { id }, data: updateUserDto });

      return {
        success: true,
        message: 'User was updated successfully.',
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async updateUserImage(request: Express.Request, file: Express.Multer.File) {
    try {
      //TODO: SOLO QUEDA POR TERMINAR.
      //! Que el usuario exista.
      //! Que solo el usuario logeado pueda actualizar la foto (ni el admin puede)
      //! Que el usuario loegado no pueda actualizar foto de otro usuario.
      //! Que la foto sea valida.
      //! Si ya tiene una foto asignada en Cloudinary, eliminarla de ahí y agregar la nueva (Hacer lo mismo en la DB).
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async disableUser(request: Express.Request, id: string) {
    try {
      const user: User = request.user as User;

      const userFounded = await prisma.user.findUnique({ where: { id } });
      if (!userFounded) throw new NotFoundException('User not founded.');
      if (user.role !== 'admin' && user.id !== id)
        throw new UnauthorizedException(
          "You don't have permission to disable a user that isn't yours.",
        );

      await prisma.user.update({
        where: { id },
        data: {
          isActive: false,
        },
      });

      return {
        success: true,
        message: 'User was disabled successfully.',
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async enableUser(token: string) {
    try {
      if (!token) throw new BadRequestException('Token is not valid.');

      const { id } = this.jwtService.decode(token);

      const userFounded = await prisma.user.findUnique({ where: { id } });
      if (!userFounded) throw new NotFoundException('User not founded.');

      if (userFounded.isActive)
        throw new BadRequestException('User is already activated.');

      await prisma.user.update({
        where: { id },
        data: {
          isActive: true,
        },
      });

      return {
        success: true,
        message: 'User was enabled successfully.',
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async deleteUser(request: Express.Request, id: string) {
    try {
      const user: User = request.user! as User;

      const userFounded = await prisma.user.findUnique({ where: { id } });
      if (!userFounded) throw new NotFoundException("User doesn't exist.");

      if (!userFounded.isActive)
        throw new NotFoundException("User isn't active.");

      if (user.role !== 'admin' && user.id !== id)
        throw new UnauthorizedException(
          "You don't have permission to delete a user that isn't yours.",
        );

      await prisma.user.delete({ where: { id } });

      return {
        succesS: true,
        message: 'User deleted succesfully.',
      };
    } catch (error) {
      this.handleErrorException(error);
    }
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
