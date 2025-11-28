import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from 'src/lib/prisma';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  private logger = new Logger();

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async findAll(paginationDto: PaginationDto) {
    const { take = 10, skip = 0 } = paginationDto;

    try {
      const totalProducts = await prisma.product.count();

      const products = await prisma.product.findMany({
        omit: {
          categoryId: true,
        },
        include: {
          productImage: {
            select: {
              id: true,
              imageUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take,
        skip,
      });
      if (products.length === 0)
        throw new NotFoundException('Products not found.');

      return {
        success: true,
        message: 'Products found',
        data: {
          products,
          totalProducts,
          currentPage: Math.floor(skip / take),
          totalPages: Math.ceil(totalProducts / take),
        },
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async searchByTerm(searchTerm: string, paginationDto: PaginationDto) {
    const { take = 10, skip = 0 } = paginationDto;

    try {
      const totalProducts = await prisma.product.count({
        where: {
          OR: [
            {
              name: { startsWith: searchTerm, mode: 'insensitive' },
              description: { startsWith: searchTerm, mode: 'insensitive' },
            },
          ],
        },
      });

      const products = await prisma.product.findMany({
        where: {
          OR: [
            {
              name: { startsWith: searchTerm, mode: 'insensitive' },
              description: { startsWith: searchTerm, mode: 'insensitive' },
            },
          ],
        },
        include: {
          productImage: {
            select: {
              id: true,
              imageUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take,
        skip,
      });
      if (products.length === 0)
        throw new NotFoundException('Products not found.');

      return {
        success: true,
        message: 'Products found',
        data: {
          products,
          totalProducts,
          currentPage: Math.floor(skip / take),
          totalPages: Math.ceil(totalProducts / take),
        },
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async findOne(id: string) {
    try {
      if (!id) throw new BadRequestException('ID parameter is required.');
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          productImage: {
            select: {
              id: true,
              imageUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      if (!product)
        throw new NotFoundException(`Product with id ${id} not found.`);

      return {
        success: true,
        message: 'Product found',
        data: {
          product,
        },
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async findProductsByCategory(
    categoryId: string,
    paginationDto: PaginationDto,
  ) {
    const { take = 10, skip = 0 } = paginationDto;

    try {
      if (!categoryId)
        throw new BadRequestException('Category ID parameter is required.');

      const totalProducts = await prisma.product.count({
        where: {
          category: {
            id: categoryId,
          },
        },
      });

      const products = await prisma.product.findMany({
        where: {
          category: {
            id: categoryId,
          },
        },
        include: {
          productImage: {
            select: {
              id: true,
              imageUrl: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
        take,
        skip,
      });

      if (!products)
        throw new NotFoundException(`Product with id ${categoryId} not found.`);

      return {
        success: true,
        message: 'Product found',
        data: {
          product: products,
          totalProducts,
          currentPage: Math.floor(skip / take),
          totalPages: Math.ceil(totalProducts / take),
        },
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async create(createProductDto: CreateProductDto) {
    try {
      const categoryIsValid = await prisma.category.findUnique({
        where: { id: createProductDto.categoryId },
      });
      if (!categoryIsValid)
        throw new NotFoundException(
          `The category with ID ${createProductDto.categoryId} does not exist.`,
        );

      await prisma.product.create({ data: createProductDto });

      return {
        success: true,
        message: 'Product created successfully.',
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const productExists = await prisma.product.findUnique({ where: { id } });
      if (!productExists)
        throw new NotFoundException(`Product with ID ${id} doesn't exist.`);

      const updatedAt = new Date();

      await prisma.product.update({
        where: {
          id,
        },
        data: {
          updatedAt,
          ...updateProductDto,
        },
      });

      return {
        success: true,
        message: 'Product was updated successfully.',
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async updateProductImage(id: string, file: Express.Multer.File) {
    const productExists = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        productImage: true,
      },
    });
    if (!productExists)
      throw new NotFoundException(`Product with ID ${id} doesn't exist.`);

    // Subir foto en Cloudinary
    const cloudinaryResponse = await this.cloudinaryService.uploadImage(
      file,
      'products',
      productExists.productImage?.publicId ?? undefined,
    );

    if (!cloudinaryResponse)
      throw new InternalServerErrorException(
        'An error occurred while updating the image.',
      );

    // Si el usuario no tiene foto, se agrega nuevo registro
    if (!productExists.productImage?.id) {
      await prisma.productImage.create({
        data: {
          imageUrl: cloudinaryResponse.url,
          publicId: cloudinaryResponse.public_id,
          productId: productExists.id,
        },
      });
    } else {
      // Si tiene foto, actualiza el registro.
      await prisma.productImage.update({
        where: { id: productExists.productImage.id },
        data: {
          imageUrl: cloudinaryResponse.url,
          publicId: cloudinaryResponse.public_id,
        },
      });
    }

    return {
      success: true,
      message: 'Product image was updated successfully.',
    };
  }

  async remove(id: string) {
    try {
      const productExists = await prisma.product.findUnique({ where: { id } });
      if (!productExists)
        throw new NotFoundException(`Product with ID ${id} doesn't exist.`);

      await prisma.product.delete({ where: { id } });

      return {
        success: true,
        message: 'Product deleted successfully.',
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
