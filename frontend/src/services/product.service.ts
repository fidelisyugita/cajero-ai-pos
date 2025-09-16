import { apiClient } from "@/lib/apiClient";
import type { Product } from "@/types/api";

export type ProductResponse = {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export type ProductError = {
  message: string;
  status: number;
};

export const productService = {
  getProducts: async (page: number): Promise<ProductResponse> => {
    return apiClient(`/product?page=${page}`);
  },

  getProduct: async (id: string): Promise<Product> => {
    return apiClient(`/product/${id}`);
  },

  updateProduct: async (
    id: string,
    data: Partial<Product>
  ): Promise<Product> => {
    return apiClient(`/product/${id}`, {
      method: "PUT",
      data,
    });
  },

  createProduct: async (data: Omit<Product, "id">): Promise<Product> => {
    return apiClient("/product", {
      method: "POST",
      data,
    });
  },

  deleteProduct: async (id: string): Promise<void> => {
    return apiClient(`/product/${id}`, {
      method: "DELETE",
    });
  },
};
