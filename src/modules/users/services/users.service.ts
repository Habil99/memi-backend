import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { IUser, IPublicUser } from '../types/user.type';
import { UserRole } from '../../../common/types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<IUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        city: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return {
      ...user,
      role: user.role as UserRole,
    };
  }

  async getProfile(userId: string): Promise<IUser> {
    return this.findById(userId);
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<IUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        city: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
    return {
      ...user,
      role: user.role as UserRole,
    };
  }

  async getPublicProfile(userId: string): Promise<IPublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar: true,
        city: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    return user;
  }

  async blockUser(adminId: string, userId: string): Promise<IUser> {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can block users');
    }
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isBlocked: true },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        city: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
    return {
      ...user,
      role: user.role as UserRole,
    };
  }

  async unblockUser(adminId: string, userId: string): Promise<IUser> {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can unblock users');
    }
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isBlocked: false },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        city: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
    return {
      ...user,
      role: user.role as UserRole,
    };
  }
}
