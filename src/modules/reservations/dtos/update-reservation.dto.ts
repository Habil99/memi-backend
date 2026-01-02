import { IsEnum, IsOptional } from 'class-validator';
import { ReservationStatus } from '../../../common/types';

export class UpdateReservationDto {
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}

