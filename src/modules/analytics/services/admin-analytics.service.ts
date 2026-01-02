import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { AnalyticsFilterDto } from '../dtos/analytics-filter.dto';

@Injectable()
export class AdminAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview(filterDto: AnalyticsFilterDto) {
    const dateFilter = this.buildDateFilter(filterDto);
    const [
      totalUsers,
      activeUsers24h,
      activeUsers7d,
      activeUsers30d,
      totalProducts,
      activeProducts,
      soldProducts,
      totalChats,
      totalReservations,
      listingToChat,
      chatToReservation,
      reservationToSold,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.getActiveUsersCount(1),
      this.getActiveUsersCount(7),
      this.getActiveUsersCount(30),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { status: 'ACTIVE' } }),
      this.prisma.product.count({ where: { status: 'SOLD' } }),
      this.prisma.chat.count(),
      this.prisma.reservation.count(),
      this.calculateConversionRate('listing', 'chat'),
      this.calculateConversionRate('chat', 'reservation'),
      this.calculateConversionRate('reservation', 'sold'),
    ]);
    return {
      totalUsers,
      activeUsers: {
        '24h': activeUsers24h,
        '7d': activeUsers7d,
        '30d': activeUsers30d,
      },
      totalProducts,
      activeProducts,
      soldProducts,
      totalChats,
      totalReservations,
      conversionRates: {
        listingToChat,
        chatToReservation,
        reservationToSold,
      },
    };
  }

  async getUserAnalytics(filterDto: AnalyticsFilterDto) {
    const dateFilter = this.buildDateFilter(filterDto);
    const [newUsers, activeUsers, usersWithListings, buyers, sellers] =
      await Promise.all([
        this.prisma.user.count({
          where: {
            createdAt: dateFilter,
          },
        }),
        this.getActiveUsersCount(30),
        this.prisma.user.count({
          where: {
            products: {
              some: {},
            },
          },
        }),
        this.prisma.user.count({
          where: {
            chatsAsBuyer: {
              some: {},
            },
          },
        }),
        this.prisma.user.count({
          where: {
            products: {
              some: {},
            },
          },
        }),
      ]);
    const topUsersByListings = await this.prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        products: {
          _count: 'desc',
        },
      },
    });
    return {
      newUsers,
      activeUsers,
      usersWithListings,
      buyers,
      sellers,
      topUsersByListings: topUsersByListings.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        listingsCount: u._count.products,
      })),
    };
  }

  async getProductAnalytics(filterDto: AnalyticsFilterDto) {
    const dateFilter = this.buildDateFilter(filterDto);
    const [
      listingsCreated,
      listingsByCategory,
      averagePriceByCategory,
      mostViewed,
      mostFavorited,
    ] = await Promise.all([
      this.prisma.product.count({
        where: {
          createdAt: dateFilter,
        },
      }),
      this.prisma.product.groupBy({
        by: ['categoryId'],
        where: dateFilter ? { createdAt: dateFilter } : {},
        _count: true,
      }),
      this.prisma.product.groupBy({
        by: ['categoryId'],
        _avg: {
          price: true,
        },
      }),
      this.prisma.analyticsEntityStats.findMany({
        where: {
          entityType: 'PRODUCT',
        },
        orderBy: {
          views: 'desc',
        },
        take: 10,
      }),
      this.prisma.analyticsEntityStats.findMany({
        where: {
          entityType: 'PRODUCT',
        },
        orderBy: {
          favorites: 'desc',
        },
        take: 10,
      }),
    ]);
    return {
      listingsCreated,
      listingsByCategory,
      averagePriceByCategory,
      mostViewed,
      mostFavorited,
    };
  }

  async getChatAnalytics(filterDto: AnalyticsFilterDto) {
    const dateFilter = this.buildDateFilter(filterDto);
    const [chatsCreated, avgMessagesPerChat, blockedChats] = await Promise.all([
      this.prisma.chat.count({
        where: {
          createdAt: dateFilter,
        },
      }),
      this.getAverageMessagesPerChat(),
      this.prisma.chat.count({
        where: {
          isBlocked: true,
        },
      }),
    ]);
    return {
      chatsCreated,
      avgMessagesPerChat: avgMessagesPerChat,
      blockedChats,
    };
  }

  async getEngagementAnalytics(filterDto: AnalyticsFilterDto) {
    const dateFilter = this.buildDateFilter(filterDto);
    const [favorites, searches, topKeywords] = await Promise.all([
      this.prisma.favorite.count({
        where: {
          createdAt: dateFilter,
        },
      }),
      this.prisma.analyticsEvent.count({
        where: {
          eventType: 'SEARCH_PERFORMED',
          createdAt: dateFilter,
        },
      }),
      this.getTopSearchKeywords(dateFilter),
    ]);
    return {
      favorites,
      searches,
      topKeywords,
    };
  }

  async getTrustSafetyAnalytics(filterDto: AnalyticsFilterDto) {
    const dateFilter = this.buildDateFilter(filterDto);
    const [reports, reportsByCategory, avgResolutionTime] = await Promise.all([
      this.prisma.report.count({
        where: {
          createdAt: dateFilter,
        },
      }),
      this.prisma.report.groupBy({
        by: ['type'],
        where: dateFilter ? { createdAt: dateFilter } : {},
        _count: true,
      }),
      this.getAverageReportResolutionTime(),
    ]);
    return {
      reports,
      reportsByCategory,
      avgResolutionTime,
    };
  }

  async getSystemAnalytics(filterDto: AnalyticsFilterDto) {
    const dateFilter = this.buildDateFilter(filterDto);
    const [
      failedLogins,
      rateLimitTriggers,
      uploadFailures,
      unauthorizedAttempts,
    ] = await Promise.all([
      this.prisma.analyticsEvent.count({
        where: {
          eventType: 'LOGIN_FAILED',
          createdAt: dateFilter,
        },
      }),
      this.prisma.analyticsEvent.count({
        where: {
          eventType: 'RATE_LIMIT_TRIGGERED',
          createdAt: dateFilter,
        },
      }),
      this.prisma.analyticsEvent.count({
        where: {
          eventType: 'FILE_UPLOAD_FAILED',
          createdAt: dateFilter,
        },
      }),
      this.prisma.analyticsEvent.count({
        where: {
          eventType: 'UNAUTHORIZED_ACTION_ATTEMPT',
          createdAt: dateFilter,
        },
      }),
    ]);
    return {
      failedLogins,
      rateLimitTriggers,
      uploadFailures,
      unauthorizedAttempts,
    };
  }

  private buildDateFilter(filterDto: AnalyticsFilterDto) {
    if (!filterDto.startDate && !filterDto.endDate) {
      return undefined;
    }
    const filter: { gte?: Date; lte?: Date } = {};
    if (filterDto.startDate) {
      filter.gte = new Date(filterDto.startDate);
    }
    if (filterDto.endDate) {
      filter.lte = new Date(filterDto.endDate);
      filter.lte.setHours(23, 59, 59, 999);
    }
    return Object.keys(filter).length > 0 ? filter : undefined;
  }

  private async getActiveUsersCount(days: number): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.prisma.user.count({
      where: {
        OR: [
          {
            products: {
              some: {
                updatedAt: {
                  gte: date,
                },
              },
            },
          },
          {
            sentMessages: {
              some: {
                createdAt: {
                  gte: date,
                },
              },
            },
          },
        ],
      },
    });
  }

  private async calculateConversionRate(
    from: string,
    to: string,
  ): Promise<number> {
    let fromCount = 0;
    let toCount = 0;
    if (from === 'listing') {
      fromCount = await this.prisma.product.count();
      toCount = await this.prisma.chat.count();
    } else if (from === 'chat') {
      fromCount = await this.prisma.chat.count();
      toCount = await this.prisma.reservation.count();
    } else if (from === 'reservation') {
      fromCount = await this.prisma.reservation.count({
        where: { status: 'ACCEPTED' },
      });
      toCount = await this.prisma.product.count({
        where: { status: 'SOLD' },
      });
    }
    return fromCount > 0 ? (toCount / fromCount) * 100 : 0;
  }

  private async getAverageMessagesPerChat(): Promise<number> {
    const result = await this.prisma.chat.findMany({
      include: {
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });
    if (result.length === 0) {
      return 0;
    }
    const totalMessages = result.reduce(
      (sum, chat) => sum + chat._count.messages,
      0,
    );
    return totalMessages / result.length;
  }

  private async getTopSearchKeywords(dateFilter?: {
    gte?: Date;
    lte?: Date;
  }): Promise<Array<{ keyword: string; count: number }>> {
    const events = await this.prisma.analyticsEvent.findMany({
      where: {
        eventType: 'SEARCH_PERFORMED',
        createdAt: dateFilter,
      },
      select: {
        metadata: true,
      },
    });
    const keywordCounts: Record<string, number> = {};
    events.forEach((event) => {
      const metadata = event.metadata as { search?: string } | null;
      if (metadata?.search) {
        keywordCounts[metadata.search] =
          (keywordCounts[metadata.search] || 0) + 1;
      }
    });
    return Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private async getAverageReportResolutionTime(): Promise<number> {
    const resolvedReports = await this.prisma.report.findMany({
      where: {
        status: { not: 'PENDING' },
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });
    if (resolvedReports.length === 0) {
      return 0;
    }
    const totalTime = resolvedReports.reduce((sum, report) => {
      const diff = report.updatedAt.getTime() - report.createdAt.getTime();
      return sum + diff;
    }, 0);
    return totalTime / resolvedReports.length / (1000 * 60 * 60);
  }
}
