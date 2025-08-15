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
  stockQuantity: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  total: number;
  status: string;
  transactionType: string;
  paymentMethod: string;
  createdAt: string;
}
