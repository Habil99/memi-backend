import { Controller, Get, Put, Param, Body, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
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
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Request() req: { user: Express.User }): Promise<IUser> {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @Request() req: { user: Express.User },
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<IUser> {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get(':id/public')
  @ApiOperation({ summary: 'Get public user profile' })
  @ApiResponse({
    status: 200,
    description: 'Public profile retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getPublicProfile(@Param('id') id: string): Promise<IPublicUser> {
    return this.usersService.getPublicProfile(id);
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async test(): Promise<{ message: string }> {
    return { message: 'Users module is working' };
  }

  @Put('admin/:id/block')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Block a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User blocked successfully' })
  async blockUser(
    @Request() req: { user: Express.User },
    @Param('id') userId: string,
  ): Promise<IUser> {
    return this.usersService.blockUser(req.user.id, userId);
  }

  @Put('admin/:id/unblock')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Unblock a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User unblocked successfully' })
  async unblockUser(
    @Request() req: { user: Express.User },
    @Param('id') userId: string,
  ): Promise<IUser> {
    return this.usersService.unblockUser(req.user.id, userId);
  }
}
