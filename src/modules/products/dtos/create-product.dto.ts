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
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCondition } from '../../../common/types';

export class CreateProductDto {
  @ApiProperty({
    example: 'Vintage Leather Jacket',
    description: 'Product title',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    example: 'Beautiful vintage leather jacket in excellent condition. Size M.',
    description: 'Product description',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({
    example: 150.5,
    description: 'Product price in AZN',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    example: ProductCondition.EXCELLENT,
    enum: ProductCondition,
    description: 'Product condition',
  })
  @IsEnum(ProductCondition)
  condition: ProductCondition;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Category ID',
  })
  @IsUUID()
  categoryId: string;

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

  @ApiProperty({
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    description: 'Product image URLs (maximum 8 images)',
    type: [String],
    maxItems: 8,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(8)
  imageUrls: string[];
}
