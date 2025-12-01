import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DiscountType } from 'generated/prisma/enums';

export class CreateCouponDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Transform(({ value }) => value?.toUpperCase())
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  description?: string;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber({ allowNaN: false })
  discountValue: number;

  @IsOptional()
  @IsNumber({ allowNaN: false })
  maxDiscount?: number;

  @IsOptional()
  @IsNumber({ allowNaN: false })
  minimumPurchase?: number;

  @IsOptional()
  @IsNumber({ allowNaN: false })
  usageLimit?: number;

  @IsOptional()
  @IsNumber({ allowNaN: false })
  perCustomerLimit?: number;

  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value).toISOString() : value))
  startDate: string;

  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value).toISOString() : value))
  endDate: string;

  //! Relaciones
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];
}
