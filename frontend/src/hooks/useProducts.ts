import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { PaginatedResponse, Product } from "@/types/api";

export const useProducts = (page: number = 0) => {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ["products", page],
    queryFn: () => apiClient(`/api/product?page=${page}&size=10`),
  });
};
