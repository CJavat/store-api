import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  @MinLength(5)
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+(?:[1-9]\d{0,2})[-\s]?\d{6,14}$/, {
    message: 'Invalid Format, please enter this format +52 3312135312',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  address?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  country?: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
