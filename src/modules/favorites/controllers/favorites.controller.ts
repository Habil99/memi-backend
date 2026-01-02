import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { FavoritesService } from '../services/favorites.service';
import { AddFavoriteDto } from '../dtos/add-favorite.dto';
import { IProduct } from '../../products/types/product.type';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiResponse({
    status: 200,
    description: 'Favorites retrieved successfully',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Vintage Leather Jacket',
          price: 150.5,
        },
      ],
    },
  })
  async getUserFavorites(
    @Request() req: { user: Express.User },
  ): Promise<IProduct[]> {
    return this.favoritesService.getUserFavorites(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add product to favorites' })
  @ApiBody({ type: AddFavoriteDto })
  @ApiResponse({
    status: 201,
    description: 'Product added to favorites',
    schema: {
      example: {
        message: 'Product added to favorites',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Product already in favorites' })
  async addFavorite(
    @Request() req: { user: Express.User },
    @Body() addFavoriteDto: AddFavoriteDto,
  ): Promise<{ message: string }> {
    await this.favoritesService.addFavorite(
      req.user.id,
      addFavoriteDto.productId,
    );
    return { message: 'Product added to favorites' };
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from favorites' })
  @ApiParam({ name: 'productId', description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Product removed from favorites',
    schema: {
      example: {
        message: 'Product removed from favorites',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  async removeFavorite(
    @Request() req: { user: Express.User },
    @Param('productId') productId: string,
  ): Promise<{ message: string }> {
    await this.favoritesService.removeFavorite(req.user.id, productId);
    return { message: 'Product removed from favorites' };
  }

  @Get('count/:productId')
  @ApiOperation({ summary: 'Get favorite count for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Favorite count retrieved',
    schema: {
      example: {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        count: 5,
      },
    },
  })
  async getFavoriteCount(@Param('productId') productId: string): Promise<{
    productId: string;
    count: number;
  }> {
    const count = await this.favoritesService.getFavoriteCount(productId);
    return { productId, count };
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Test successful',
    schema: {
      example: {
        message: 'Favorites module is working',
      },
    },
  })
  async test(): Promise<{ message: string }> {
    return { message: 'Favorites module is working' };
  }
}
