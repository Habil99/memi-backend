export interface IMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  sender?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface IChat {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  product?: {
    id: string;
    title: string;
    price: number;
    images: Array<{ url: string }>;
  };
  buyer?: {
    id: string;
    name: string;
    avatar: string | null;
  };
  seller?: {
    id: string;
    name: string;
    avatar: string | null;
  };
  messages?: IMessage[];
  unreadCount?: number;
}
