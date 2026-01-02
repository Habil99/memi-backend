import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminAnalyticsService } from '../services/admin-analytics.service';
import { AnalyticsFilterDto } from '../dtos/analytics-filter.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/types';

@ApiTags('admin-analytics')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('admin/analytics')
export class AdminAnalyticsController {
  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get platform overview analytics (Admin only)' })
  @ApiQuery({ type: AnalyticsFilterDto })
  @ApiResponse({
    status: 200,
    description: 'Overview analytics retrieved successfully',
    schema: {
      example: {
        totalUsers: 1000,
        totalProducts: 5000,
        totalChats: 2000,
        totalReservations: 500,
      },
    },
  })
  async getOverview(@Query() filterDto: AnalyticsFilterDto) {
    return this.adminAnalyticsService.getOverview(filterDto);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user analytics (Admin only)' })
  @ApiQuery({ type: AnalyticsFilterDto })
  @ApiResponse({
    status: 200,
    description: 'User analytics retrieved successfully',
    schema: {
      example: {
        totalUsers: 1000,
        newUsers: 50,
        activeUsers: 800,
      },
    },
  })
  async getUserAnalytics(@Query() filterDto: AnalyticsFilterDto) {
    return this.adminAnalyticsService.getUserAnalytics(filterDto);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get product analytics (Admin only)' })
  @ApiQuery({ type: AnalyticsFilterDto })
  @ApiResponse({
    status: 200,
    description: 'Product analytics retrieved successfully',
    schema: {
      example: {
        totalProducts: 5000,
        activeProducts: 4500,
        soldProducts: 500,
      },
    },
  })
  async getProductAnalytics(@Query() filterDto: AnalyticsFilterDto) {
    return this.adminAnalyticsService.getProductAnalytics(filterDto);
  }

  @Get('chats')
  @ApiOperation({ summary: 'Get chat analytics (Admin only)' })
  @ApiQuery({ type: AnalyticsFilterDto })
  @ApiResponse({
    status: 200,
    description: 'Chat analytics retrieved successfully',
    schema: {
      example: {
        totalChats: 2000,
        activeChats: 500,
        totalMessages: 10000,
      },
    },
  })
  async getChatAnalytics(@Query() filterDto: AnalyticsFilterDto) {
    return this.adminAnalyticsService.getChatAnalytics(filterDto);
  }

  @Get('engagement')
  @ApiOperation({ summary: 'Get engagement analytics (Admin only)' })
  @ApiQuery({ type: AnalyticsFilterDto })
  @ApiResponse({
    status: 200,
    description: 'Engagement analytics retrieved successfully',
    schema: {
      example: {
        dailyActiveUsers: 200,
        averageSessionDuration: 15,
        pageViews: 5000,
      },
    },
  })
  async getEngagementAnalytics(@Query() filterDto: AnalyticsFilterDto) {
    return this.adminAnalyticsService.getEngagementAnalytics(filterDto);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get trust & safety analytics (Admin only)' })
  @ApiQuery({ type: AnalyticsFilterDto })
  @ApiResponse({
    status: 200,
    description: 'Trust & safety analytics retrieved successfully',
    schema: {
      example: {
        totalReports: 100,
        pendingReports: 20,
        resolvedReports: 80,
      },
    },
  })
  async getTrustSafetyAnalytics(@Query() filterDto: AnalyticsFilterDto) {
    return this.adminAnalyticsService.getTrustSafetyAnalytics(filterDto);
  }

  @Get('system')
  @ApiOperation({ summary: 'Get system & security analytics (Admin only)' })
  @ApiQuery({ type: AnalyticsFilterDto })
  @ApiResponse({
    status: 200,
    description: 'System analytics retrieved successfully',
    schema: {
      example: {
        loginAttempts: 5000,
        failedLogins: 100,
        unauthorizedAttempts: 50,
      },
    },
  })
  async getSystemAnalytics(@Query() filterDto: AnalyticsFilterDto) {
    return this.adminAnalyticsService.getSystemAnalytics(filterDto);
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Test successful',
    schema: {
      example: {
        message: 'Admin Analytics module is working',
      },
    },
  })
  test(): { message: string } {
    return { message: 'Admin Analytics module is working' };
  }
}
