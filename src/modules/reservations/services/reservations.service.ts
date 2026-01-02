import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { CreateReservationDto } from '../dtos/create-reservation.dto';
import { UpdateReservationDto } from '../dtos/update-reservation.dto';
import { IReservation } from '../types/reservation.type';
import { ReservationStatus, ProductStatus } from '../../../common/types';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    buyerId: string,
    createReservationDto: CreateReservationDto,
  ): Promise<IReservation> {
    const product = await this.prisma.product.findUnique({
      where: { id: createReservationDto.productId },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with ID "${createReservationDto.productId}" not found`,
      );
    }
    if (product.sellerId === buyerId) {
      throw new BadRequestException('You cannot reserve your own product');
    }
    if (product.status !== ProductStatus.ACTIVE) {
      throw new BadRequestException('Product is not available for reservation');
    }
    const existingReservation = await this.prisma.reservation.findFirst({
      where: {
        productId: createReservationDto.productId,
        buyerId,
        status: {
          in: [ReservationStatus.REQUESTED, ReservationStatus.ACCEPTED],
        },
      },
    });
    if (existingReservation) {
      throw new BadRequestException(
        'You already have an active reservation for this product',
      );
    }
    const reservation = await this.prisma.reservation.create({
      data: {
        productId: createReservationDto.productId,
        buyerId,
        status: ReservationStatus.REQUESTED,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    return this.mapReservationToIReservation(reservation);
  }

  async update(
    id: string,
    userId: string,
    updateReservationDto: UpdateReservationDto,
  ): Promise<IReservation> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID "${id}" not found`);
    }
    const isSeller = reservation.product.sellerId === userId;
    const isBuyer = reservation.buyerId === userId;
    if (!isSeller && !isBuyer) {
      throw new ForbiddenException(
        'You can only update reservations for your own products or your own reservations',
      );
    }
    if (
      updateReservationDto.status === ReservationStatus.ACCEPTED &&
      !isSeller
    ) {
      throw new ForbiddenException('Only the seller can accept a reservation');
    }
    if (
      updateReservationDto.status === ReservationStatus.REJECTED &&
      !isSeller
    ) {
      throw new ForbiddenException('Only the seller can reject a reservation');
    }
    if (
      updateReservationDto.status === ReservationStatus.CANCELLED &&
      !isBuyer
    ) {
      throw new ForbiddenException('Only the buyer can cancel a reservation');
    }
    const updatedReservation = await this.prisma.reservation.update({
      where: { id },
      data: { status: updateReservationDto.status },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    if (updateReservationDto.status === ReservationStatus.ACCEPTED) {
      await this.prisma.product.update({
        where: { id: reservation.productId },
        data: { status: ProductStatus.RESERVED },
      });
    }
    return this.mapReservationToIReservation(updatedReservation);
  }

  async findByProductId(productId: string): Promise<IReservation[]> {
    const reservations = await this.prisma.reservation.findMany({
      where: { productId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return reservations.map((r) => this.mapReservationToIReservation(r));
  }

  async findByBuyerId(buyerId: string): Promise<IReservation[]> {
    const reservations = await this.prisma.reservation.findMany({
      where: { buyerId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return reservations.map((r) => this.mapReservationToIReservation(r));
  }

  async findBySellerId(sellerId: string): Promise<IReservation[]> {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        product: {
          sellerId,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return reservations.map((r) => this.mapReservationToIReservation(r));
  }

  async findById(id: string): Promise<IReservation> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID "${id}" not found`);
    }
    return this.mapReservationToIReservation(reservation);
  }

  private mapReservationToIReservation(reservation: any): IReservation {
    return {
      id: reservation.id,
      productId: reservation.productId,
      buyerId: reservation.buyerId,
      status: reservation.status,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
      product: reservation.product
        ? {
            id: reservation.product.id,
            title: reservation.product.title,
            price: Number(reservation.product.price),
            status: reservation.product.status,
            images: reservation.product.images || [],
          }
        : undefined,
      buyer: reservation.buyer
        ? {
            id: reservation.buyer.id,
            name: reservation.buyer.name,
            avatar: reservation.buyer.avatar,
          }
        : undefined,
    };
  }
}
