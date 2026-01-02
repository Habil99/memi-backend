import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from '../services/reports.service';
import { CreateReportDto } from '../dtos/create-report.dto';
import { IReport } from '../types/report.type';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/types';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  @ApiBody({ type: CreateReportDto })
  @ApiResponse({
    status: 201,
    description: 'Report created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'SPAM',
        reason: 'This product contains inappropriate content',
        status: 'PENDING',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async create(
    @Request() req: { user: Express.User },
    @Body() createReportDto: CreateReportDto,
  ): Promise<IReport> {
    return this.reportsService.create(req.user.id, createReportDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all reports (Admin only)' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by report status',
    example: 'PENDING',
  })
  @ApiResponse({
    status: 200,
    description: 'Reports retrieved successfully',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'SPAM',
          status: 'PENDING',
        },
      ],
    },
  })
  async findAll(@Query('status') status?: string): Promise<IReport[]> {
    return this.reportsService.findAll(status);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get report by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Report ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Report retrieved successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'SPAM',
        reason: 'Inappropriate content',
        status: 'PENDING',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async findById(@Param('id') id: string): Promise<IReport> {
    return this.reportsService.findById(id);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update report status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Report ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'RESOLVED',
          description: 'New report status',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Report status updated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'RESOLVED',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req: { user: Express.User },
  ): Promise<IReport> {
    return this.reportsService.updateStatus(id, body.status, req.user.id);
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Test successful',
    schema: {
      example: {
        message: 'Reports module is working',
      },
    },
  })
  test(): { message: string } {
    return { message: 'Reports module is working' };
  }
}
