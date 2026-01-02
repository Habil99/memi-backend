import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import {
  IAnalyticsEvent,
  AnalyticsEventType,
  AnalyticsEntityType,
} from '../types/analytics-event.type';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async trackEvent(
    event: IAnalyticsEvent,
    request?: { ip?: string; userAgent?: string },
  ): Promise<void> {
    try {
      const ip = this.hashIp(request?.ip);
      await this.prisma.analyticsEvent.create({
        data: {
          eventType: event.eventType,
          userId: event.userId,
          entityType: event.entityType,
          entityId: event.entityId,
          metadata: event.metadata || null,
          ip,
          userAgent: request?.userAgent || null,
        },
      });
      await this.updateEntityStats(event);
    } catch (error) {
      this.logger.error(`Failed to track event: ${error}`, error.stack);
    }
  }

  async trackEventAsync(
    event: IAnalyticsEvent,
    request?: { ip?: string; userAgent?: string },
  ): Promise<void> {
    setImmediate(() => {
      this.trackEvent(event, request).catch((error) => {
        this.logger.error(`Async event tracking failed: ${error}`);
      });
    });
  }

  private async updateEntityStats(event: IAnalyticsEvent): Promise<void> {
    if (!event.entityType || !event.entityId) {
      return;
    }
    try {
      const stats = await this.prisma.analyticsEntityStats.findUnique({
        where: {
          entityType_entityId: {
            entityType: event.entityType,
            entityId: event.entityId,
          },
        },
      });
      const updateData: {
        views?: { increment: number };
        favorites?: { increment: number };
        messages?: { increment: number };
        reservations?: { increment: number };
        reports?: { increment: number };
      } = {};
      switch (event.eventType) {
        case AnalyticsEventType.PRODUCT_VIEWED:
          updateData.views = { increment: 1 };
          break;
        case AnalyticsEventType.PRODUCT_FAVORITED:
        case AnalyticsEventType.FAVORITE_ADDED:
          updateData.favorites = { increment: 1 };
          break;
        case AnalyticsEventType.MESSAGE_SENT:
          updateData.messages = { increment: 1 };
          break;
        case AnalyticsEventType.PRODUCT_RESERVED:
          updateData.reservations = { increment: 1 };
          break;
        case AnalyticsEventType.PRODUCT_REPORTED:
        case AnalyticsEventType.USER_REPORTED:
        case AnalyticsEventType.CHAT_REPORTED:
          updateData.reports = { increment: 1 };
          break;
      }
      if (Object.keys(updateData).length === 0) {
        return;
      }
      if (stats) {
        await this.prisma.analyticsEntityStats.update({
          where: {
            entityType_entityId: {
              entityType: event.entityType,
              entityId: event.entityId,
            },
          },
          data: updateData,
        });
      } else {
        await this.prisma.analyticsEntityStats.create({
          data: {
            entityType: event.entityType,
            entityId: event.entityId,
            ...updateData,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to update entity stats: ${error}`);
    }
  }

  private hashIp(ip?: string): string | null {
    if (!ip) {
      return null;
    }
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
    return ip.substring(0, ip.lastIndexOf(':')) + ':xxx';
  }

  async aggregateDailyStats(date: Date): Promise<void> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      const [
        totalUsers,
        newUsersToday,
        activeUsersToday,
        totalProducts,
        activeProducts,
        soldProductsToday,
        totalChats,
        messagesToday,
        reservationsToday,
        favoritesToday,
        searchesToday,
        reportsToday,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
        this.prisma.user.count({
          where: {
            OR: [
              {
                products: {
                  some: {
                    updatedAt: {
                      gte: startOfDay,
                      lte: endOfDay,
                    },
                  },
                },
              },
              {
                sentMessages: {
                  some: {
                    createdAt: {
                      gte: startOfDay,
                      lte: endOfDay,
                    },
                  },
                },
              },
            ],
          },
        }),
        this.prisma.product.count(),
        this.prisma.product.count({
          where: { status: 'ACTIVE' },
        }),
        this.prisma.product.count({
          where: {
            status: 'SOLD',
            updatedAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
        this.prisma.chat.count(),
        this.prisma.message.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
        this.prisma.reservation.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
        this.prisma.favorite.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
        this.prisma.analyticsEvent.count({
          where: {
            eventType: 'SEARCH_PERFORMED',
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
        this.prisma.report.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        }),
      ]);
      await this.prisma.analyticsDailyStats.upsert({
        where: { date: startOfDay },
        update: {
          totalUsers,
          activeUsers: activeUsersToday,
          newUsers: newUsersToday,
          totalProducts,
          activeProducts,
          soldProducts: soldProductsToday,
          totalChats,
          totalMessages: messagesToday,
          totalReservations: reservationsToday,
          totalFavorites: favoritesToday,
          totalSearches: searchesToday,
          totalReports: reportsToday,
        },
        create: {
          date: startOfDay,
          totalUsers,
          activeUsers: activeUsersToday,
          newUsers: newUsersToday,
          totalProducts,
          activeProducts,
          soldProducts: soldProductsToday,
          totalChats,
          totalMessages: messagesToday,
          totalReservations: reservationsToday,
          totalFavorites: favoritesToday,
          totalSearches: searchesToday,
          totalReports: reportsToday,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to aggregate daily stats: ${error}`);
    }
  }
}
