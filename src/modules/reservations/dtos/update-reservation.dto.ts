import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '../../../common/types';

export class UpdateReservationDto {
  @ApiProperty({
    example: ReservationStatus.ACCEPTED,
    enum: ReservationStatus,
    description: 'New reservation status',
  })
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}
