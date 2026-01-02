import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../common/services/prisma.service';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { IAuthResponse } from '../types/auth-response.type';
import { IJwtPayload } from '../strategies/jwt.strategy';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import {
  AnalyticsEventType,
  AnalyticsEntityType,
} from '../../analytics/types/analytics-event.type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(forwardRef(() => AnalyticsService))
    private analyticsService: AnalyticsService,
  ) {}

  async register(registerDto: RegisterDto): Promise<IAuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        city: registerDto.city,
        phone: registerDto.phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    void this.analyticsService.trackEventAsync({
      eventType: AnalyticsEventType.USER_REGISTERED,
      userId: user.id,
      entityType: AnalyticsEntityType.USER,
      entityId: user.id,
    });
    return {
      ...tokens,
      user,
    };
  }

  async login(
    loginDto: LoginDto,
    request?: { ip?: string; userAgent?: string },
  ): Promise<IAuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });
    if (!user) {
      void this.analyticsService.trackEventAsync(
        {
          eventType: AnalyticsEventType.LOGIN_FAILED,
          metadata: { email: loginDto.email },
        },
        request,
      );
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.isBlocked) {
      void this.analyticsService.trackEventAsync(
        {
          eventType: AnalyticsEventType.LOGIN_FAILED,
          userId: user.id,
          metadata: { reason: 'blocked' },
        },
        request,
      );
      throw new UnauthorizedException('User account is blocked');
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      void this.analyticsService.trackEventAsync(
        {
          eventType: AnalyticsEventType.LOGIN_FAILED,
          userId: user.id,
        },
        request,
      );
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    void this.analyticsService.trackEventAsync({
      eventType: AnalyticsEventType.USER_LOGGED_IN,
      userId: user.id,
      entityType: AnalyticsEntityType.USER,
      entityId: user.id,
    });
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: IJwtPayload | undefined;
    try {
      payload = this.jwtService.verify<IJwtPayload>(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'your-refresh-secret',
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user || user.isBlocked) {
        throw new UnauthorizedException('User not found or blocked');
      }
      const newAccessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        {
          secret:
            this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
        },
      );
      return { accessToken: newAccessToken };
    } catch (error) {
      console.error(error);
      void this.analyticsService.trackEventAsync({
        eventType: AnalyticsEventType.UNAUTHORIZED_ACTION_ATTEMPT,
        userId: payload?.sub,
      });
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(payload: IJwtPayload): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'your-refresh-secret',
        expiresIn:
          this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
