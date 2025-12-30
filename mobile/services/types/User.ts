export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  storeId: string;
  roleCode: string;
  imageUrl?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  roleCode: string; // "CASHIER" | "MANAGER"
  password?: string;
  phone?: string;
}
