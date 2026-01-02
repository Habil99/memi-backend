import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { IProduct } from '../../products/types/product.type';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(userId: string, productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
    if (existingFavorite) {
      throw new ConflictException('Product is already in favorites');
    }
    await this.prisma.favorite.create({
      data: {
        userId,
        productId,
      },
    });
  }

  async removeFavorite(userId: string, productId: string): Promise<void> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }
    await this.prisma.favorite.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async getUserFavorites(userId: string): Promise<IProduct[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
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
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((favorite) => ({
      id: favorite.product.id,
      title: favorite.product.title,
      description: favorite.product.description,
      price: Number(favorite.product.price),
      condition: favorite.product.condition,
      categoryId: favorite.product.categoryId,
      subcategoryId: favorite.product.subcategoryId,
      size: favorite.product.size,
      color: favorite.product.color,
      brand: favorite.product.brand,
      material: favorite.product.material,
      location: favorite.product.location,
      status: favorite.product.status,
      sellerId: favorite.product.sellerId,
      createdAt: favorite.product.createdAt,
      updatedAt: favorite.product.updatedAt,
      images: favorite.product.images.map((img) => ({
        id: img.id,
        url: img.url,
        order: img.order,
      })),
      category: favorite.product.category,
      subcategory: favorite.product.subcategory,
      seller: favorite.product.seller,
      favoriteCount: favorite.product._count.favorites,
      isFavorite: true,
    }));
  }

  async getFavoriteCount(productId: string): Promise<number> {
    return this.prisma.favorite.count({
      where: { productId },
    });
  }
}
