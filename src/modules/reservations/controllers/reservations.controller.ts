import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateReservationDto } from '../dtos/create-reservation.dto';
import { UpdateReservationDto } from '../dtos/update-reservation.dto';
import { ReservationsService } from '../services/reservations.service';
import { IReservation } from '../types/reservation.type';

@ApiTags('reservations')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiBody({ type: CreateReservationDto })
  @ApiResponse({
    status: 201,
    description: 'Reservation created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        productId: '123e4567-e89b-12d3-a456-426614174001',
        buyerId: '123e4567-e89b-12d3-a456-426614174002',
        status: 'PENDING',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async create(
    @Request() req: { user: Express.User },
    @Body() createReservationDto: CreateReservationDto,
  ): Promise<IReservation> {
    return this.reservationsService.create(req.user.id, createReservationDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user reservations' })
  @ApiResponse({
    status: 200,
    description: 'Reservations retrieved successfully',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          productId: '123e4567-e89b-12d3-a456-426614174001',
          status: 'PENDING',
        },
      ],
    },
  })
  async getMyReservations(
    @Request() req: { user: Express.User },
  ): Promise<IReservation[]> {
    return this.reservationsService.findByBuyerId(req.user.id);
  }

  @Get('my-sales')
  @ApiOperation({ summary: 'Get reservations for current user products' })
  @ApiResponse({
    status: 200,
    description: 'Reservations retrieved successfully',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          productId: '123e4567-e89b-12d3-a456-426614174001',
          status: 'PENDING',
        },
      ],
    },
  })
  async getMySales(
    @Request() req: { user: Express.User },
  ): Promise<IReservation[]> {
    return this.reservationsService.findBySellerId(req.user.id);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get reservations for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Reservations retrieved successfully',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          productId: '123e4567-e89b-12d3-a456-426614174000',
          status: 'PENDING',
        },
      ],
    },
  })
  async getByProductId(
    @Param('productId') productId: string,
  ): Promise<IReservation[]> {
    return this.reservationsService.findByProductId(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reservation by ID' })
  @ApiParam({ name: 'id', description: 'Reservation ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Reservation retrieved successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        productId: '123e4567-e89b-12d3-a456-426614174001',
        buyerId: '123e4567-e89b-12d3-a456-426614174002',
        status: 'PENDING',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async findById(@Param('id') id: string): Promise<IReservation> {
    return this.reservationsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update reservation status' })
  @ApiParam({ name: 'id', description: 'Reservation ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateReservationDto })
  @ApiResponse({
    status: 200,
    description: 'Reservation updated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'CONFIRMED',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async update(
    @Param('id') id: string,
    @Request() req: { user: Express.User },
    @Body() updateReservationDto: UpdateReservationDto,
  ): Promise<IReservation> {
    return this.reservationsService.update(
      id,
      req.user.id,
      updateReservationDto,
    );
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Test successful',
    schema: {
      example: {
        message: 'Reservations module is working',
      },
    },
  })
  test(): { message: string } {
    return { message: 'Reservations module is working' };
  }
}
