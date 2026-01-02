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
  @ApiResponse({ status: 201, description: 'Reservation created successfully' })
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
  })
  async getMySales(
    @Request() req: { user: Express.User },
  ): Promise<IReservation[]> {
    return this.reservationsService.findBySellerId(req.user.id);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get reservations for a product' })
  @ApiResponse({
    status: 200,
    description: 'Reservations retrieved successfully',
  })
  async getByProductId(
    @Param('productId') productId: string,
  ): Promise<IReservation[]> {
    return this.reservationsService.findByProductId(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reservation by ID' })
  @ApiResponse({
    status: 200,
    description: 'Reservation retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async findById(@Param('id') id: string): Promise<IReservation> {
    return this.reservationsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update reservation status' })
  @ApiResponse({ status: 200, description: 'Reservation updated successfully' })
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
  @ApiResponse({ status: 200, description: 'Test successful' })
  test(): { message: string } {
    return { message: 'Reservations module is working' };
  }
}
