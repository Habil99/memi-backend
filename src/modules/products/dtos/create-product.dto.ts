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
import { ProductCondition } from '../../../common/types';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(ProductCondition)
  condition: ProductCondition;

  @IsUUID()
  categoryId: string;

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

  @IsArray()
  @IsString({ each: true })
  @MaxLength(8, {
    message: 'Maximum 8 images allowed',
  })
  imageUrls: string[];
}
