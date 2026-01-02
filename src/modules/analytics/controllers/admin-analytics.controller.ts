import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
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
  @ApiResponse({
    status: 200,
    description: 'Overview analytics retrieved successfully',
  })
  async getOverview(@Query() filterDto: AnalyticsFilterDto) {
    return this.adminAnalyticsService.getOverview(filterDto);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user analytics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User analytics retrieved successfully',
  })
  async getUserAnalytics(@Query() filterDto: AnalyticsFilterDto) {
    return this.adminAnalyticsService.getUserAnalytics(filterDto);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get product analytics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Product analytics retrieved successfully',
  })
  async getProductAnalytics(@Query() filterDto: AnalyticsFilterDto) {
    return this.adminAnalyticsService.getProductAnalytics(filterDto);
  }

  @Get('chats')
  @ApiOperation({ summary: 'Get chat analytics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Chat analytics retrieved successfully',
  })
  async getChatAnalytics(@Query() filterDto: AnalyticsFilterDto) {
    return this.adminAnalyticsService.getChatAnalytics(filterDto);
  }

  @Get('engagement')
  @ApiOperation({ summary: 'Get engagement analytics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Engagement analytics retrieved successfully',
  })
  async getEngagementAnalytics(@Query() filterDto: AnalyticsFilterDto) {
    return this.adminAnalyticsService.getEngagementAnalytics(filterDto);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get trust & safety analytics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Trust & safety analytics retrieved successfully',
  })
  async getTrustSafetyAnalytics(@Query() filterDto: AnalyticsFilterDto) {
    return this.adminAnalyticsService.getTrustSafetyAnalytics(filterDto);
  }

  @Get('system')
  @ApiOperation({ summary: 'Get system & security analytics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'System analytics retrieved successfully',
  })
  async getSystemAnalytics(@Query() filterDto: AnalyticsFilterDto) {
    return this.adminAnalyticsService.getSystemAnalytics(filterDto);
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async test(): Promise<{ message: string }> {
    return { message: 'Admin Analytics module is working' };
  }
}
