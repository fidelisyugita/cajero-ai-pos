export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Product {
  id: string;
  name: string;
  measureUnitCode: string;
  sellingPrice: number;
  stock: number;
  createdAt: string;
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
