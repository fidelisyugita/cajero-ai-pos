export interface Location {
  street?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  phone?: string;
  imageUrl?: string;
  description?: string;
  location?: Location;
  bankAccount?: string;
  bankNo?: string;
  createdAt?: string;
  updatedAt?: string;
  maxDiscount?: number;
}
