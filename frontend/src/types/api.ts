export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  imageUrl: string;
  description: string;
  stock: number;
  rejectCount: number;
  soldCount: number;
  categoryCode: string;
  measureUnitCode: string;
  measureUnitName: string;
  barcode: string;
  buyingPrice: number;
  sellingPrice: number;
  commission: number;
  discount: number;
  tax: number;
  ingredients: Ingredient[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Ingredient {
  ingredientId: string;
  name: string;
  description: string;
  stock: number;
  measureUnitCode: string;
  measureUnitName: string;
  quantityNeeded: number;
}

export interface ProductCategory {
  code: string;
  storeId: string;
  name: string;
  description: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export interface Transaction {
  id: string;
  total: number;
  status: string;
  transactionType: string;
  paymentMethod: string;
  createdAt: string;
}
export interface Log {
  id: string;
  storeId: string;
  type: string;
  action: string;
  details: string;
  createdAt: string;
}
