import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { PaginatedResponse, Product } from "@/types/api";

export const useProducts = (page: number = 0, size: number = 20) => {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ["products", page],
    queryFn: () => apiClient(`/product?page=${page}&size=${size}`),
  });
};
