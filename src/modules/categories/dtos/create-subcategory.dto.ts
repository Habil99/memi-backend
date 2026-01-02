import { IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubcategoryDto {
  @ApiProperty({
    example: 'Jackets',
    description: 'Subcategory name',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'jackets',
    description: 'Subcategory slug (URL-friendly)',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  slug: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Parent category ID',
  })
  @IsUUID()
  categoryId: string;
}
