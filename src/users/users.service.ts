import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from 'src/lib/prisma';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import { UpdateUserDto } from './dto/update-user.dto';
//TODO: TERMINAR SERVICIO.
@Injectable()
export class UsersService {
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

      if (!users || users.length === 0)
        throw new NotFoundException('Users not found.');

      return {
        success: true,
        message: 'Usuarios encontrados.',
        users,
        totalUsers,
        currentPage: Math.floor(skip / take) + 1,
        totalPages: Math.ceil(totalUsers / take),
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        `Ocurrió un error al buscar los usuarios: ${error.message}`,
      );
    }
  }

  findOneUser(id: string) {
    return `This action returns a #${id} user`;
  }

  updateUser(id: string, updateUserDto: UpdateUserDto) {
    //TODO: Hacer validación al actualizar el email (que no sea repetido).
    return `This action updates a #${id} user`;
  }

  updateUserImage(file: Express.Multer.File) {
    return 'This actions updates image user';
  }

  disableUser(id: string) {
    return `This action disables the user ${id}`;
  }

  enableUser(id: string) {
    return `This action disables the user ${id}`;
  }

  deleteUser(id: string) {
    return `This action removes a #${id} user`;
  }
}
