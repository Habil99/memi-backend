import {
  IsEnum,
  IsString,
  IsUUID,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ReportType } from '../../../common/types';

export class CreateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  chatId?: string;

  @IsString()
  @MinLength(10)
  reason: string;
}
