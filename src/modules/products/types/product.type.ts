import { ProductCondition, ProductStatus } from '../../../common/types';

export interface IProductImage {
  id: string;
  url: string;
  order: number;
}

export interface IProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: ProductCondition;
  categoryId: string;
  subcategoryId: string | null;
  size: string | null;
  color: string | null;
  brand: string | null;
  material: string | null;
  location: string | null;
  status: ProductStatus;
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
  images: IProductImage[];
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  };
  seller?: {
    id: string;
    name: string;
    avatar: string | null;
    city: string | null;
  };
  favoriteCount?: number;
  isFavorite?: boolean;
}

export interface IPaginatedProducts {
  data: IProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
