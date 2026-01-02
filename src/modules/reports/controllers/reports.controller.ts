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
  @ApiResponse({ status: 201, description: 'Report created successfully' })
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
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  async findAll(@Query('status') status?: string): Promise<IReport[]> {
    return this.reportsService.findAll(status);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get report by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async findById(@Param('id') id: string): Promise<IReport> {
    return this.reportsService.findById(id);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update report status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Report status updated successfully',
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
  @ApiResponse({ status: 200, description: 'Test successful' })
  test(): { message: string } {
    return { message: 'Reports module is working' };
  }
}
