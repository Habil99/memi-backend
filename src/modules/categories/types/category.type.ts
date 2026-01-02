export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryWithSubcategories extends ICategory {
  subcategories: ISubcategory[];
}
