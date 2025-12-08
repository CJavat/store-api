import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  description?: string;

  @IsString()
  @MinLength(6)
  @MaxLength(25)
  sku: string;

  @IsInt()
  stock: number;

  @IsString()
  @MinLength(5)
  slug: string;

  @IsString()
  @MinLength(3)
  @MaxLength(15)
  type: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'price must be a valid number with up to 2 decimal places' },
  )
  price: number;

  @IsString()
  @IsUUID()
  categoryId: string;

  @IsString()
  @IsUUID()
  supplierId: string;
}
