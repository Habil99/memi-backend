import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { INotification } from '../types/notification.type';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<INotification> {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata: metadata || null,
        isRead: false,
      },
    });
    return this.mapNotificationToINotification(notification);
  }

  async findByUserId(userId: string, isRead?: boolean): Promise<INotification[]> {
    const where: { userId: string; isRead?: boolean } = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }
    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return notifications.map((n) => this.mapNotificationToINotification(n));
  }

  async markAsRead(id: string, userId: string): Promise<INotification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }
    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }
    const updatedNotification = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return this.mapNotificationToINotification(updatedNotification);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
    return { count: result.count };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }
    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }
    await this.prisma.notification.delete({
      where: { id },
    });
  }

  private mapNotificationToINotification(
    notification: any,
  ): INotification {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      metadata: notification.metadata as Record<string, unknown> | null,
      createdAt: notification.createdAt,
    };
  }
}

