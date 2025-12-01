import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { prisma } from 'src/lib/prisma';
import { User } from 'generated/prisma/client';

@Injectable()
export class CouponsService {
  private logger = new Logger();

  async findAll(isActive?: boolean) {
    try {
      const coupons = await prisma.coupon.findMany({
        where: isActive === undefined ? {} : { isActive },
        include: {
          couponUsages: true,
          applicableCategories: true,
          applicableProducts: true,
          assignedUsers: true,
          _count: true,
        },
      });
      if (coupons.length === 0)
        throw new NotFoundException('Coupons not found.');

      return {
        success: true,
        message: 'Coupons found.',
        data: {
          coupons,
        },
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async findOne(id: string) {
    try {
      const coupon = await prisma.coupon.findUnique({
        where: { id },
        include: {
          couponUsages: true,
          applicableCategories: true,
          applicableProducts: true,
          assignedUsers: true,
          _count: true,
        },
      });
      if (!coupon)
        throw new NotFoundException(`Coupon with ID ${id} doesn't exist.`);

      return {
        success: true,
        message: 'Coupon was found.',
        data: {
          coupon,
        },
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async couponsByUser(request: Express.Request) {
    try {
      const user = request.user as User;

      const coupons = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          assignedCoupons: true,
          couponUsages: true,
          UserAddress: true,
          userImage: true,
        },
      });
      if (!coupons)
        throw new NotFoundException(
          `User with ID ${user.id} does not have any available coupons.`,
        );

      return {
        success: true,
        message: 'Coupons found.',
        data: {
          coupons,
        },
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async create(createCouponDto: CreateCouponDto) {
    try {
      const {
        productIds,
        categoryIds,
        userIds,
        startDate,
        endDate,
        ...couponData
      } = createCouponDto;

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Verificar fechas válidas
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('Invalid date format.');
      }

      // Verificar rango válido
      if (start >= end) {
        throw new BadRequestException(
          'startDate must be earlier than endDate.',
        );
      }

      await prisma.coupon.create({
        data: {
          ...couponData,
          startDate: start,
          endDate: end,
          ...(productIds?.length
            ? {
                applicableProducts: {
                  connect: productIds.map((id) => ({ id })),
                },
              }
            : {}),
          ...(categoryIds?.length
            ? {
                applicableCategories: {
                  connect: categoryIds.map((id) => ({ id })),
                },
              }
            : {}),
          ...(userIds?.length
            ? {
                assignedUsers: {
                  connect: userIds.map((id) => ({ id })),
                },
              }
            : {}),
        },
      });

      return {
        success: true,
        message: 'Coupon created successfully.',
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    try {
      const {
        productIds,
        categoryIds,
        userIds,
        startDate,
        endDate,
        ...couponData
      } = updateCouponDto;

      const coupon = await prisma.coupon.findUnique({ where: { id } });
      if (!coupon)
        throw new NotFoundException(`Coupon with ID ${id} not found.`);

      const now = new Date();

      const start = startDate ? new Date(startDate) : coupon.startDate;
      const end = endDate ? new Date(endDate) : coupon.endDate;

      // Verificar fechas válidas
      if (isNaN(start.getTime()) || isNaN(end.getTime()))
        throw new BadRequestException('Invalid date format.');

      if (startDate && start <= now)
        throw new BadRequestException('Invalid start date.');

      if (start >= end)
        throw new BadRequestException(
          'startDate must be earlier than endDate.',
        );

      const updateData: any = {
        ...couponData,
        startDate: start,
        endDate: end,
      };

      //? Relaciones
      if (productIds) {
        updateData.applicableProducts = {
          set: productIds.map((id) => ({ id })),
        };
      }

      if (categoryIds) {
        updateData.applicableCategories = {
          set: categoryIds.map((id) => ({ id })),
        };
      }

      if (userIds) {
        updateData.assignedUsers = {
          set: userIds.map((id) => ({ id })),
        };
      }

      await prisma.coupon.update({
        where: { id },
        data: updateData,
      });

      return {
        success: true,
        message: 'Coupon updated successfully.',
      };
    } catch (error) {
      this.handleErrorException(error);
    }
  }

  async remove(id: string) {
    try {
      const couponFound = await prisma.coupon.findUnique({ where: { id } });
      if (!couponFound)
        throw new NotFoundException(`Coupon with ID ${id} not found.`);

      await prisma.coupon.delete({ where: { id } });

      return {
        success: true,
        message: 'Coupon deleted successfully.',
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
