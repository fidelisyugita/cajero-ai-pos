import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ProductCategory } from "@/types/api";

export const useProductCategories = () => {
  return useQuery<ProductCategory[]>({
    queryKey: ["productCategories"],
    queryFn: () => apiClient(`/product-category`),
  });
};
