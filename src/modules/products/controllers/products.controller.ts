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
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async findAll(
    @Query() filterDto: FilterProductsDto,
    @Request() req?: { user?: Express.User },
  ): Promise<IPaginatedProducts> {
    return this.productsService.findAll(filterDto, req?.user?.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findById(
    @Param('id') id: string,
    @Request() req?: { user?: Express.User },
  ): Promise<IProduct> {
    return this.productsService.findById(id, req?.user?.id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
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
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
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
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
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
  @ApiResponse({ status: 200, description: 'Test successful' })
  test(): { message: string } | Promise<{ message: string }> {
    return Promise.resolve({ message: 'Products module is working' });
  }
}
