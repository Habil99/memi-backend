import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsEnum,
  MinLength,
  Min,
  IsArray,
  MaxLength,
} from 'class-validator';
import { ProductCondition, ProductStatus } from '../../../common/types';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  subcategoryId?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(8, {
    message: 'Maximum 8 images allowed',
  })
  imageUrls?: string[];
}
