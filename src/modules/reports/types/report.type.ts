import { ReportType } from '../../../common/types';

export interface IReport {
  id: string;
  type: ReportType;
  reporterId: string;
  productId: string | null;
  userId: string | null;
  chatId: string | null;
  reason: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
}

