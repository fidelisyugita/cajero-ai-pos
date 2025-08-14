export interface User {
  id: string;
  name: string;
  email: string;
  roleCode: string;
  storeId: string;
  imageUrl?: string;
}

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  roleCode: string;
  storeId: string;
  imageUrl?: string;
  accessToken: string;
}
