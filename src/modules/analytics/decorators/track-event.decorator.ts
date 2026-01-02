import { SetMetadata } from '@nestjs/common';
import { AnalyticsEventType } from '../types/analytics-event.type';

export const TRACK_EVENT_KEY = 'trackEvent';
export const TrackEvent = (eventType: AnalyticsEventType) =>
  SetMetadata(TRACK_EVENT_KEY, eventType);
