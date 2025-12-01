import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { prisma } from 'src/lib/prisma';

@Injectable()
export class CategoriesService {
  private logger = new Logger();

  async findAll() {
    try {
      const categories = await prisma.category.findMany();
      if (categories.length === 0)
        throw new NotFoundException('Categories not found.');

      return {
        success: true,
        message: 'Categories were found.',
        data: {
          categories,
        },
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async findOne(id: string) {
    try {
      const category = await prisma.category.findUnique({ where: { id } });
      if (!category)
        throw new NotFoundException(`Category with id ${id} not found.`);

      return {
        success: true,
        message: 'Categories were found.',
        data: {
          category,
        },
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const newCategory = await prisma.category.create({
        data: {
          name: createCategoryDto.name.toLowerCase().trim(),
        },
      });

      return {
        success: true,
        message: 'Category created successfully.',
        data: {
          category: newCategory,
        },
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      if (!updateCategoryDto.name)
        throw new BadRequestException(
          'El nombre de la categoría es obligatorio.',
        );

      const updateCategory = await prisma.category.update({
        where: { id },
        data: {
          name: updateCategoryDto.name.toLowerCase().trim(),
        },
      });

      return {
        success: true,
        message: 'Category updated successfully.',
        data: {
          category: updateCategory,
        },
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async remove(id: string) {
    try {
      if (!id) throw new BadRequestException('El id es obligatorio.');

      const categoryFound = await prisma.category.findUnique({
        where: { id },
      });
      if (!categoryFound)
        throw new NotFoundException(
          `The category with id ${id} does not exist.`,
        );

      await prisma.category.delete({ where: { id } });

      return {
        success: true,
        message: 'The category was deleted.',
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
