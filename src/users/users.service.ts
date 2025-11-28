import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { prisma } from 'src/lib/prisma';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from 'generated/prisma/client';

@Injectable()
export class UsersService {
  private logger = new Logger();

  constructor(
    private jwtService: JwtService,
    private cloudinaryService: CloudinaryService,
  ) {}

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

      if (updateUserDto.password)
        throw new BadRequestException(
          `Password cannot be updated in this endpoint.`,
        );

      const userFounded = await prisma.user.findUnique({ where: { id } });
      if (!userFounded) throw new NotFoundException('User not found.');

      if (user.role !== 'admin' && user.id !== id)
        throw new UnauthorizedException(
          "You don't have permission to update a user that isn't yours.",
        );

      const updatedAt = new Date();
      await prisma.user.update({
        where: { id },
        data: {
          updatedAt,
          ...updateUserDto,
        },
      });

      return {
        success: true,
        message: 'User was updated successfully.',
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async updatePassword(
    request: Express.Request,
    updatePasswordDto: UpdatePasswordDto,
  ) {
    const user = request.user as User;
    const passwordEncrypted = bcrypt.hashSync(updatePasswordDto.password, 10);

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: passwordEncrypted },
      });

      return {
        success: true,
        message: 'User password was updated successfully.',
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async updateUserImage(request: Express.Request, file: Express.Multer.File) {
    try {
      const user = request.user as User;

      const userExists = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          userImage: true,
        },
      });
      if (!userExists) throw new NotFoundException("User doesn't exist.");

      // Subir foto en Cloudinary
      const cloudinaryResponse = await this.cloudinaryService.uploadImage(
        file,
        'users',
        userExists.userImage?.publicId ?? undefined,
      );

      if (!cloudinaryResponse)
        throw new InternalServerErrorException(
          'An error occurred while updating the image.',
        );

      // Si el usuario no tiene foto, se agrega nuevo registro
      if (!userExists.userImage?.id) {
        await prisma.userImage.create({
          data: {
            imageUrl: cloudinaryResponse.url,
            publicId: cloudinaryResponse.public_id,
            userId: user.id,
          },
        });
      } else {
        // Si tiene foto, actualiza el registro.
        await prisma.userImage.update({
          where: { id: userExists.userImage.id },
          data: {
            imageUrl: cloudinaryResponse.url,
            publicId: cloudinaryResponse.public_id,
          },
        });
      }

      return {
        success: true,
        message: 'User image was updated successfully.',
      };
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
