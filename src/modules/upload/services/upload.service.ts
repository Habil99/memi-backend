import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUploadResponse } from '../types/upload-response.type';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  validateFile(file: Express.Multer.File): void {
    const maxSize =
      this.configService.get<number>('upload.maxFileSize') || 5242880;
    const allowedTypes = this.configService.get<string[]>(
      'upload.allowedMimeTypes',
    ) || ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      );
    }
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }
  }

  validateFiles(files: Express.Multer.File[]): void {
    const maxFiles = this.configService.get<number>('upload.maxFiles') || 8;
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    if (files.length > maxFiles) {
      throw new BadRequestException(
        `Maximum ${maxFiles} files allowed. Received ${files.length} files.`,
      );
    }
    files.forEach((file) => this.validateFile(file));
  }

  processFile(file: Express.Multer.File): IUploadResponse {
    this.validateFile(file);
    if (!file.path && !file.buffer) {
      throw new InternalServerErrorException('File processing failed');
    }
    const url = file.path || this.generateUrlFromBuffer(file);
    return {
      url,
      filename: file.filename || file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  processFiles(files: Express.Multer.File[]): IUploadResponse[] {
    this.validateFiles(files);
    return files.map((file) => this.processFile(file));
  }

  private generateUrlFromBuffer(file: Express.Multer.File): string {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }
}
