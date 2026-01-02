import { ReservationStatus } from '../../../common/types';

export interface IReservation {
  id: string;
  productId: string;
  buyerId: string;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
  product?: {
    id: string;
    title: string;
    price: number;
    status: string;
    images: Array<{ url: string }>;
  };
  buyer?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}
