import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Clothing',
    description: 'Category name',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'clothing',
    description: 'Category slug (URL-friendly)',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  slug: string;

  @ApiPropertyOptional({
    example: 'All types of clothing items',
    description: 'Category description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
