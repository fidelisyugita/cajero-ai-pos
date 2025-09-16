import { apiClient } from "@/lib/apiClient";
import type { ProductCategory } from "@/types/api";

export type ProductCategoryError = {
  message: string;
  status: number;
};

export const productCategoryService = {
  getProductCategories: async (): Promise<ProductCategory[]> => {
    return apiClient(`/product-category`);
  },

  getProductCategory: async (id: string): Promise<ProductCategory> => {
    return apiClient(`/product-category/${id}`);
  },

  updateProductCategory: async (
    id: string,
    data: Partial<ProductCategory>
  ): Promise<ProductCategory> => {
    return apiClient(`/product-category/${id}`, {
      method: "PUT",
      data,
    });
  },

  createProductCategory: async (
    data: Omit<ProductCategory, "id">
  ): Promise<ProductCategory> => {
    return apiClient("/product-category", {
      method: "POST",
      data,
    });
  },

  deleteProductCategory: async (id: string): Promise<void> => {
    return apiClient(`/product-category/${id}`, {
      method: "DELETE",
    });
  },
};
