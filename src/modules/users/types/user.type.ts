import { UserRole } from '../../../common/types';

export interface IUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  city: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
}

export interface IPublicUser {
  id: string;
  name: string;
  avatar: string | null;
  city: string | null;
}
