import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { CreateSubcategoryDto } from '../dtos/create-subcategory.dto';
import {
  ICategory,
  ISubcategory,
  ICategoryWithSubcategories,
} from '../types/category.type';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<ICategory[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return categories;
  }

  async findAllWithSubcategories(): Promise<ICategoryWithSubcategories[]> {
    const categories = await this.prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
    return categories;
  }

  async findById(id: string): Promise<ICategory> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return category;
  }

  async findBySlug(slug: string): Promise<ICategoryWithSubcategories> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        subcategories: {
          orderBy: { name: 'asc' },
        },
      },
    });
    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<ICategory> {
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug: createCategoryDto.slug },
    });
    if (existingCategory) {
      throw new ConflictException(
        `Category with slug "${createCategoryDto.slug}" already exists`,
      );
    }
    const category = await this.prisma.category.create({
      data: createCategoryDto,
    });
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<ICategory> {
    const category = await this.findById(id);
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingCategory = await this.prisma.category.findUnique({
        where: { slug: updateCategoryDto.slug },
      });
      if (existingCategory) {
        throw new ConflictException(
          `Category with slug "${updateCategoryDto.slug}" already exists`,
        );
      }
    }
    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
    return updatedCategory;
  }

  async delete(id: string): Promise<void> {
    const category = await this.findById(id);
    await this.prisma.category.delete({
      where: { id: category.id },
    });
  }

  async createSubcategory(
    createSubcategoryDto: CreateSubcategoryDto,
  ): Promise<ISubcategory> {
    const category = await this.findById(createSubcategoryDto.categoryId);
    const existingSubcategory = await this.prisma.subcategory.findUnique({
      where: {
        categoryId_slug: {
          categoryId: createSubcategoryDto.categoryId,
          slug: createSubcategoryDto.slug,
        },
      },
    });
    if (existingSubcategory) {
      throw new ConflictException(
        `Subcategory with slug "${createSubcategoryDto.slug}" already exists in this category`,
      );
    }
    const subcategory = await this.prisma.subcategory.create({
      data: createSubcategoryDto,
    });
    return subcategory;
  }

  async findSubcategoryById(id: string): Promise<ISubcategory> {
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id },
    });
    if (!subcategory) {
      throw new NotFoundException(`Subcategory with ID "${id}" not found`);
    }
    return subcategory;
  }

  async deleteSubcategory(id: string): Promise<void> {
    const subcategory = await this.findSubcategoryById(id);
    await this.prisma.subcategory.delete({
      where: { id: subcategory.id },
    });
  }
}
