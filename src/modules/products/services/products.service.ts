import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/services/prisma.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { FilterProductsDto } from '../dtos/filter-products.dto';
import { IProduct, IPaginatedProducts } from '../types/product.type';
import { ProductStatus, ProductCondition } from '../../../common/types';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import {
  AnalyticsEventType,
  AnalyticsEntityType,
} from '../../analytics/types/analytics-event.type';

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: true;
    category: {
      select: {
        id: true;
        name: true;
        slug: true;
      };
    };
    subcategory: {
      select: {
        id: true;
        name: true;
        slug: true;
      };
    };
    seller: {
      select: {
        id: true;
        name: true;
        avatar: true;
        city: true;
      };
    };
  };
}>;

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AnalyticsService))
    private analyticsService: AnalyticsService,
  ) {}

  async create(
    sellerId: string,
    createProductDto: CreateProductDto,
  ): Promise<IProduct> {
    if (createProductDto.imageUrls.length === 0) {
      throw new BadRequestException('At least one image is required');
    }
    if (createProductDto.imageUrls.length > 8) {
      throw new BadRequestException('Maximum 8 images allowed');
    }
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Category with ID "${createProductDto.categoryId}" not found`,
      );
    }
    if (createProductDto.subcategoryId) {
      const subcategory = await this.prisma.subcategory.findUnique({
        where: { id: createProductDto.subcategoryId },
      });
      if (
        !subcategory ||
        subcategory.categoryId !== createProductDto.categoryId
      ) {
        throw new BadRequestException(
          'Subcategory does not belong to the category',
        );
      }
    }
    const product = await this.prisma.product.create({
      data: {
        title: createProductDto.title,
        description: createProductDto.description,
        price: createProductDto.price,
        condition: createProductDto.condition,
        categoryId: createProductDto.categoryId,
        subcategoryId: createProductDto.subcategoryId,
        size: createProductDto.size,
        color: createProductDto.color,
        brand: createProductDto.brand,
        material: createProductDto.material,
        location: createProductDto.location,
        sellerId,
        images: {
          create: createProductDto.imageUrls.map((url, index) => ({
            url,
            order: index,
          })),
        },
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        subcategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            city: true,
          },
        },
      },
    });
    void this.analyticsService.trackEventAsync({
      eventType: AnalyticsEventType.PRODUCT_CREATED,
      userId: sellerId,
      entityType: AnalyticsEntityType.PRODUCT,
      entityId: product.id,
      metadata: {
        categoryId: createProductDto.categoryId,
        price: Number(createProductDto.price),
      },
    });
    return this.mapProductToIProduct(product);
  }

  async findAll(
    filterDto: FilterProductsDto,
    userId?: string,
  ): Promise<IPaginatedProducts> {
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {
      status: filterDto.status || ProductStatus.ACTIVE,
    };
    if (filterDto.categoryId) {
      where.categoryId = filterDto.categoryId;
    }
    if (filterDto.subcategoryId) {
      where.subcategoryId = filterDto.subcategoryId;
    }
    if (filterDto.sellerId) {
      where.sellerId = filterDto.sellerId;
    }
    if (filterDto.condition) {
      where.condition = filterDto.condition;
    }
    if (filterDto.location) {
      where.location = { contains: filterDto.location, mode: 'insensitive' };
    }
    if (filterDto.brand) {
      where.brand = { contains: filterDto.brand, mode: 'insensitive' };
    }
    if (filterDto.color) {
      where.color = { contains: filterDto.color, mode: 'insensitive' };
    }
    if (filterDto.minPrice !== undefined || filterDto.maxPrice !== undefined) {
      where.price = {};
      if (filterDto.minPrice !== undefined) {
        where.price.gte = filterDto.minPrice;
      }
      if (filterDto.maxPrice !== undefined) {
        where.price.lte = filterDto.maxPrice;
      }
    }
    if (filterDto.search) {
      where.OR = [
        { title: { contains: filterDto.search, mode: 'insensitive' } },
        { description: { contains: filterDto.search, mode: 'insensitive' } },
        { brand: { contains: filterDto.search, mode: 'insensitive' } },
      ];
    }
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          subcategory: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true,
              city: true,
            },
          },
          _count: {
            select: {
              favorites: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);
    let favoriteProductIds: string[] = [];
    if (userId) {
      const favorites = await this.prisma.favorite.findMany({
        where: {
          userId,
          productId: { in: products.map((p) => p.id) },
        },
        select: { productId: true },
      });
      favoriteProductIds = favorites.map((f) => f.productId);
    }
    const mappedProducts = products.map((product) => ({
      ...this.mapProductToIProduct(product),
      favoriteCount: product._count.favorites,
      isFavorite: favoriteProductIds.includes(product.id),
    }));
    return {
      data: mappedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(
    id: string,
    userId?: string,
    request?: { ip?: string; userAgent?: string },
  ): Promise<IProduct> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        subcategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            city: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    let isFavorite = false;
    if (userId) {
      const favorite = await this.prisma.favorite.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: id,
          },
        },
      });
      isFavorite = !!favorite;
    }
    const result = {
      ...this.mapProductToIProduct(product),
      favoriteCount: product._count.favorites,
      isFavorite,
    };
    void this.analyticsService.trackEventAsync(
      {
        eventType: AnalyticsEventType.PRODUCT_VIEWED,
        userId,
        entityType: AnalyticsEntityType.PRODUCT,
        entityId: id,
      },
      request,
    );
    return result;
  }

  async update(
    id: string,
    userId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<IProduct> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    if (product.sellerId !== userId) {
      throw new ForbiddenException('You can only update your own products');
    }
    if (updateProductDto.imageUrls && updateProductDto.imageUrls.length > 8) {
      throw new BadRequestException('Maximum 8 images allowed');
    }
    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Category with ID "${updateProductDto.categoryId}" not found`,
        );
      }
    }
    if (updateProductDto.subcategoryId) {
      const subcategory = await this.prisma.subcategory.findUnique({
        where: { id: updateProductDto.subcategoryId },
      });
      if (
        !subcategory ||
        (updateProductDto.categoryId &&
          subcategory.categoryId !== updateProductDto.categoryId)
      ) {
        throw new BadRequestException(
          'Subcategory does not belong to the category',
        );
      }
    }
    const updateData: Prisma.ProductUpdateInput = {
      ...(updateProductDto.title && { title: updateProductDto.title }),
      ...(updateProductDto.description && {
        description: updateProductDto.description,
      }),
      ...(updateProductDto.price !== undefined && {
        price: updateProductDto.price,
      }),
      ...(updateProductDto.condition && {
        condition: updateProductDto.condition,
      }),
      ...(updateProductDto.categoryId && {
        categoryId: updateProductDto.categoryId,
      }),
      ...(updateProductDto.subcategoryId !== undefined && {
        subcategoryId: updateProductDto.subcategoryId,
      }),
      ...(updateProductDto.size !== undefined && {
        size: updateProductDto.size,
      }),
      ...(updateProductDto.color !== undefined && {
        color: updateProductDto.color,
      }),
      ...(updateProductDto.brand !== undefined && {
        brand: updateProductDto.brand,
      }),
      ...(updateProductDto.material !== undefined && {
        material: updateProductDto.material,
      }),
      ...(updateProductDto.location !== undefined && {
        location: updateProductDto.location,
      }),
      ...(updateProductDto.status && { status: updateProductDto.status }),
    };
    if (updateProductDto.imageUrls) {
      await this.prisma.productImage.deleteMany({
        where: { productId: id },
      });
      updateData.images = {
        create: updateProductDto.imageUrls.map((url, index) => ({
          url,
          order: index,
        })),
      };
    }
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        subcategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            city: true,
          },
        },
      },
    });
    return this.mapProductToIProduct(updatedProduct);
  }

  async delete(id: string, userId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    if (product.sellerId !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }
    await this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.DELETED },
    });
  }

  private mapProductToIProduct(product: ProductWithRelations): IProduct {
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: Number(product.price),
      condition: product.condition as ProductCondition,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      size: product.size,
      color: product.color,
      brand: product.brand,
      material: product.material,
      location: product.location,
      status: product.status as ProductStatus,
      sellerId: product.sellerId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      images: product.images || [],
      category: product.category ?? undefined,
      subcategory: product.subcategory ?? undefined,
      seller: product.seller ?? undefined,
    };
  }
}
