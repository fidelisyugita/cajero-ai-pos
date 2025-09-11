import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Product } from "@/types/api";

export const useProduct = (id: string) => {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => apiClient(`/product/${id}`),
  });
};
