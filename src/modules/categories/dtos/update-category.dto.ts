import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Clothing',
    description: 'Category name',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({
    example: 'clothing',
    description: 'Category slug (URL-friendly)',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  slug?: string;

  @ApiPropertyOptional({
    example: 'All types of clothing items',
    description: 'Category description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
