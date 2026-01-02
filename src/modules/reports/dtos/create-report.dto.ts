import {
  IsEnum,
  IsString,
  IsUUID,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportType } from '../../../common/types';

export class CreateReportDto {
  @ApiProperty({
    example: ReportType.PRODUCT,
    enum: ReportType,
    description: 'Type of report',
  })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Product ID (required for product reports)',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'User ID (required for user reports)',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174002',
    description: 'Chat ID (required for chat reports)',
  })
  @IsOptional()
  @IsUUID()
  chatId?: string;

  @ApiProperty({
    example: 'This product contains inappropriate content',
    description: 'Reason for the report',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  reason: string;
}
