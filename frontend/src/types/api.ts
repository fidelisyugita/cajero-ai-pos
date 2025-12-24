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

export interface TransactionProduct {
  productId: string;
  categoryCode: string;
  measureUnitCode: string;
  name: string;
  description: string;
  stock: number;
  rejectCount: number;
  soldCount: number;
  imageUrl: string;
  selectedVariants: any;
  note: string;
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  commission: number;
  discount: number;
  tax: number;
}

export interface Transaction {
  id: string;
  totalPrice: number;
  totalTax: number;
  totalDiscount: number;
  statusCode: string;
  transactionTypeCode: string;
  paymentMethodCode: string;
  transactionProduct: TransactionProduct[];
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
