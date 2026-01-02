import { Module, Global } from '@nestjs/common';
import { AnalyticsService } from './services/analytics.service';
import { AdminAnalyticsService } from './services/admin-analytics.service';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';

@Global()
@Module({
  imports: [],
  controllers: [AdminAnalyticsController],
  providers: [AnalyticsService, AdminAnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
