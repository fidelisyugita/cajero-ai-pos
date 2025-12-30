import api from "@/lib/axios";
import type { CreateProductCategoryRequest, ProductCategory } from "../types/ProductCategory";

export const postProductCategory = async (
  data: CreateProductCategoryRequest,
): Promise<ProductCategory> => {
  const response = await api.post<ProductCategory>("/product-category", data);
  return response.data;
};
