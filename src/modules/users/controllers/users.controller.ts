import { Controller, Get, Put, Param, Body, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { IUser, IPublicUser } from '../types/user.type';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/types';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'USER',
        city: 'Baku',
        phone: '+994501234567',
      },
    },
  })
  async getProfile(@Request() req: { user: Express.User }): Promise<IUser> {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        name: 'John Doe Updated',
        city: 'Baku',
      },
    },
  })
  async updateProfile(
    @Request() req: { user: Express.User },
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<IUser> {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get(':id/public')
  @ApiOperation({ summary: 'Get public user profile' })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Public profile retrieved successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        city: 'Baku',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getPublicProfile(@Param('id') id: string): Promise<IPublicUser> {
    return this.usersService.getPublicProfile(id);
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Test successful',
    schema: {
      example: {
        message: 'Users module is working',
      },
    },
  })
  test(): { message: string } {
    return { message: 'Users module is working' };
  }

  @Put('admin/:id/block')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Block a user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID to block', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'User blocked successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        isBlocked: true,
      },
    },
  })
  async blockUser(
    @Request() req: { user: Express.User },
    @Param('id') userId: string,
  ): Promise<IUser> {
    return this.usersService.blockUser(req.user.id, userId);
  }

  @Put('admin/:id/unblock')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Unblock a user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID to unblock', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'User unblocked successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        isBlocked: false,
      },
    },
  })
  async unblockUser(
    @Request() req: { user: Express.User },
    @Param('id') userId: string,
  ): Promise<IUser> {
    return this.usersService.unblockUser(req.user.id, userId);
  }
}
