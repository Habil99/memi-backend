import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsEnum,
  MinLength,
  Min,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCondition, ProductStatus } from '../../../common/types';

export class UpdateProductDto {
  @ApiPropertyOptional({
    example: 'Vintage Leather Jacket',
    description: 'Product title',
    minLength: 3,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiPropertyOptional({
    example: 'Beautiful vintage leather jacket in excellent condition.',
    description: 'Product description',
    minLength: 10,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiPropertyOptional({
    example: 150.5,
    description: 'Product price in AZN',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    example: ProductCondition.EXCELLENT,
    enum: ProductCondition,
    description: 'Product condition',
  })
  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Category ID',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'Subcategory ID',
  })
  @IsOptional()
  @IsUUID()
  subcategoryId?: string;

  @ApiPropertyOptional({
    example: 'M',
    description: 'Product size',
  })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({
    example: 'Brown',
    description: 'Product color',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    example: 'Zara',
    description: 'Product brand',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    example: 'Leather',
    description: 'Product material',
  })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({
    example: 'Baku',
    description: 'Product location',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: ProductStatus.ACTIVE,
    enum: ProductStatus,
    description: 'Product status',
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({
    example: ['https://example.com/image1.jpg'],
    description: 'Product image URLs (maximum 8 images)',
    type: [String],
    maxItems: 8,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(8)
  imageUrls?: string[];
}
