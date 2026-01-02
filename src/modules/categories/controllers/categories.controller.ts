import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { CreateSubcategoryDto } from '../dtos/create-subcategory.dto';
import {
  ICategory,
  ISubcategory,
  ICategoryWithSubcategories,
} from '../types/category.type';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/types';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async findAll(): Promise<ICategory[]> {
    return this.categoriesService.findAll();
  }

  @Get('with-subcategories')
  @ApiOperation({ summary: 'Get all categories with subcategories' })
  @ApiResponse({
    status: 200,
    description: 'Categories with subcategories retrieved successfully',
  })
  async findAllWithSubcategories(): Promise<ICategoryWithSubcategories[]> {
    return this.categoriesService.findAllWithSubcategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findById(@Param('id') id: string): Promise<ICategory> {
    return this.categoriesService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findBySlug(
    @Param('slug') slug: string,
  ): Promise<ICategoryWithSubcategories> {
    return this.categoriesService.findBySlug(slug);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 409, description: 'Category already exists' })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<ICategory> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ICategory> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.categoriesService.delete(id);
    return { message: 'Category deleted successfully' };
  }

  @Post('subcategories')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new subcategory (Admin only)' })
  @ApiResponse({ status: 201, description: 'Subcategory created successfully' })
  @ApiResponse({ status: 409, description: 'Subcategory already exists' })
  async createSubcategory(
    @Body() createSubcategoryDto: CreateSubcategoryDto,
  ): Promise<ISubcategory> {
    return this.categoriesService.createSubcategory(createSubcategoryDto);
  }

  @Delete('subcategories/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a subcategory (Admin only)' })
  @ApiResponse({ status: 200, description: 'Subcategory deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subcategory not found' })
  async deleteSubcategory(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.categoriesService.deleteSubcategory(id);
    return { message: 'Subcategory deleted successfully' };
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  test(): { message: string } {
    return { message: 'Categories module is working' };
  }
}
