import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService, type ProductError } from "@/services/product.service";
import { queryKeys } from "@/lib/query-keys";
import type { Product } from "@/types/api";

export const useProducts = (page: number = 0) => {
  return useQuery({
    queryKey: queryKeys.products.list(page),
    queryFn: () => productService.getProducts(page),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Product,
    ProductError,
    { id: string; data: Partial<Product> }
  >({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      // Invalidate specific product query
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(updatedProduct.id),
      });
      // Invalidate products list
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.all,
      });
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<Product, ProductError, Omit<Product, "id">>({
    mutationFn: (data) => productService.createProduct(data),
    onSuccess: () => {
      // Invalidate products list
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.all,
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ProductError, string>({
    mutationFn: (id) => productService.deleteProduct(id),
    onSuccess: () => {
      // Invalidate products list
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.all,
      });
    },
  });
};
