import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { CreateReportDto } from '../dtos/create-report.dto';
import { IReport } from '../types/report.type';
import { ReportType } from '../../../common/types';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(reporterId: string, createReportDto: CreateReportDto): Promise<IReport> {
    this.validateReportTarget(createReportDto);
    const report = await this.prisma.report.create({
      data: {
        type: createReportDto.type,
        reporterId,
        productId: createReportDto.productId,
        userId: createReportDto.userId,
        chatId: createReportDto.chatId,
        reason: createReportDto.reason,
        status: 'PENDING',
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return this.mapReportToIReport(report);
  }

  async findAll(status?: string): Promise<IReport[]> {
    const where = status ? { status } : {};
    const reports = await this.prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return reports.map((r) => this.mapReportToIReport(r));
  }

  async findById(id: string): Promise<IReport> {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    if (!report) {
      throw new NotFoundException(`Report with ID "${id}" not found`);
    }
    return this.mapReportToIReport(report);
  }

  async updateStatus(
    id: string,
    status: string,
    adminId: string,
  ): Promise<IReport> {
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update report status');
    }
    const report = await this.findById(id);
    const updatedReport = await this.prisma.report.update({
      where: { id },
      data: { status },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return this.mapReportToIReport(updatedReport);
  }

  private validateReportTarget(createReportDto: CreateReportDto): void {
    if (createReportDto.type === ReportType.PRODUCT && !createReportDto.productId) {
      throw new BadRequestException('Product ID is required for product reports');
    }
    if (createReportDto.type === ReportType.USER && !createReportDto.userId) {
      throw new BadRequestException('User ID is required for user reports');
    }
    if (createReportDto.type === ReportType.CHAT && !createReportDto.chatId) {
      throw new BadRequestException('Chat ID is required for chat reports');
    }
  }

  private mapReportToIReport(report: any): IReport {
    return {
      id: report.id,
      type: report.type,
      reporterId: report.reporterId,
      productId: report.productId,
      userId: report.userId,
      chatId: report.chatId,
      reason: report.reason,
      status: report.status,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      reporter: report.reporter
        ? {
            id: report.reporter.id,
            name: report.reporter.name,
            email: report.reporter.email,
          }
        : undefined,
    };
  }
}

