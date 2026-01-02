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
  @ApiResponse({ status: 200, description: 'Favorites retrieved successfully' })
  async getUserFavorites(
    @Request() req: { user: Express.User },
  ): Promise<IProduct[]> {
    return this.favoritesService.getUserFavorites(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add product to favorites' })
  @ApiResponse({ status: 201, description: 'Product added to favorites' })
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
  @ApiResponse({ status: 200, description: 'Product removed from favorites' })
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
  @ApiResponse({ status: 200, description: 'Favorite count retrieved' })
  async getFavoriteCount(@Param('productId') productId: string): Promise<{
    productId: string;
    count: number;
  }> {
    const count = await this.favoritesService.getFavoriteCount(productId);
    return { productId, count };
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async test(): Promise<{ message: string }> {
    return { message: 'Favorites module is working' };
  }
}
