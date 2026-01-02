import { UserRole } from './index';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      isBlocked: boolean;
    }
  }
}

export {};
