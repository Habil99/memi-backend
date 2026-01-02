import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
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
} from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service';
import { INotification } from '../types/notification.type';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({
    name: 'isRead',
    required: false,
    description: 'Filter by read status',
    example: 'false',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'RESERVATION_CREATED',
          message: 'New reservation for your product',
          isRead: false,
        },
      ],
    },
  })
  async getNotifications(
    @Request() req: { user: Express.User },
    @Query('isRead') isRead?: string,
  ): Promise<INotification[]> {
    const isReadFilter = isRead !== undefined ? isRead === 'true' : undefined;
    return this.notificationsService.findByUserId(req.user.id, isReadFilter);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    schema: {
      example: {
        count: 5,
      },
    },
  })
  async getUnreadCount(
    @Request() req: { user: Express.User },
  ): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        isRead: true,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @Param('id') id: string,
    @Request() req: { user: Express.User },
  ): Promise<INotification> {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
    schema: {
      example: {
        count: 5,
      },
    },
  })
  async markAllAsRead(
    @Request() req: { user: Express.User },
  ): Promise<{ count: number }> {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
    schema: {
      example: {
        message: 'Notification deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async delete(
    @Param('id') id: string,
    @Request() req: { user: Express.User },
  ): Promise<{ message: string }> {
    await this.notificationsService.delete(id, req.user.id);
    return { message: 'Notification deleted successfully' };
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Test successful',
    schema: {
      example: {
        message: 'Notifications module is working',
      },
    },
  })
  test(): { message: string } {
    return { message: 'Notifications module is working' };
  }
}
