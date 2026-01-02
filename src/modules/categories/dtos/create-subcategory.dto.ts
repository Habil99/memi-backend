import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateSubcategoryDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  slug: string;

  @IsUUID()
  categoryId: string;
}
