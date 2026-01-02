import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { FilterProductsDto } from '../dtos/filter-products.dto';
import { IProduct, IPaginatedProducts } from '../types/product.type';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with filters' })
  @ApiQuery({ type: FilterProductsDto })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Vintage Leather Jacket',
            description: 'Beautiful vintage leather jacket',
            price: 150.5,
            condition: 'EXCELLENT',
            status: 'ACTIVE',
            sellerId: '123e4567-e89b-12d3-a456-426614174001',
          },
        ],
        total: 100,
        page: 1,
        limit: 20,
        totalPages: 5,
      },
    },
  })
  async findAll(
    @Query() filterDto: FilterProductsDto,
    @Request() req?: { user?: Express.User },
  ): Promise<IPaginatedProducts> {
    return this.productsService.findAll(filterDto, req?.user?.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Vintage Leather Jacket',
        description: 'Beautiful vintage leather jacket',
        price: 150.5,
        condition: 'EXCELLENT',
        status: 'ACTIVE',
        sellerId: '123e4567-e89b-12d3-a456-426614174001',
        images: [],
        category: { id: '...', name: 'Clothing' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findById(
    @Param('id') id: string,
    @Request()
    req?: {
      user?: Express.User;
      ip?: string;
      headers?: { 'user-agent'?: string };
    },
  ): Promise<IProduct> {
    return this.productsService.findById(id, req?.user?.id, {
      ip: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    });
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Vintage Leather Jacket',
        description: 'Beautiful vintage leather jacket',
        price: 150.5,
        condition: 'EXCELLENT',
        status: 'ACTIVE',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Request() req: { user: Express.User },
    @Body() createProductDto: CreateProductDto,
  ): Promise<IProduct> {
    return this.productsService.create(req.user.id, createProductDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated Product Title',
        price: 200,
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden - not the owner' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id') id: string,
    @Request() req: { user: Express.User },
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<IProduct> {
    return this.productsService.update(id, req.user.id, updateProductDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (soft delete)' })
  @ApiParam({ name: 'id', description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    schema: {
      example: {
        message: 'Product deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden - not the owner' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async delete(
    @Param('id') id: string,
    @Request() req: { user: Express.User },
  ): Promise<{ message: string }> {
    await this.productsService.delete(id, req.user.id);
    return { message: 'Product deleted successfully' };
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Test successful',
    schema: {
      example: {
        message: 'Products module is working',
      },
    },
  })
  test(): { message: string } | Promise<{ message: string }> {
    return Promise.resolve({ message: 'Products module is working' });
  }
}
