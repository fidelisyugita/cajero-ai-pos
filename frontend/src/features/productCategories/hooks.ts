import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productCategoryService,
  type ProductCategoryError,
} from "@/services/productCategory.service";
import { queryKeys } from "@/lib/query-keys";
import type { ProductCategory } from "@/types/api";

export const useProductCategories = () => {
  return useQuery({
    queryKey: queryKeys.productCategories.all,
    queryFn: () => productCategoryService.getProductCategories(),
  });
};

export const useProductCategory = (id: string) => {
  return useQuery({
    queryKey: queryKeys.productCategories.detail(id),
    queryFn: () => productCategoryService.getProductCategory(id),
    enabled: !!id,
  });
};

export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ProductCategory,
    ProductCategoryError,
    { id: string; data: Partial<ProductCategory> }
  >({
    mutationFn: ({ id, data }) =>
      productCategoryService.updateProductCategory(id, data),
    onSuccess: (updatedProductCategory) => {
      // Invalidate specific productCategory query
      queryClient.invalidateQueries({
        queryKey: queryKeys.productCategories.detail(
          updatedProductCategory.code
        ),
      });
      // Invalidate productCategories list
      queryClient.invalidateQueries({
        queryKey: queryKeys.productCategories.all,
      });
    },
  });
};

export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ProductCategory,
    ProductCategoryError,
    Omit<ProductCategory, "id">
  >({
    mutationFn: (data) => productCategoryService.createProductCategory(data),
    onSuccess: () => {
      // Invalidate productCategories list
      queryClient.invalidateQueries({
        queryKey: queryKeys.productCategories.all,
      });
    },
  });
};

export const useDeleteProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ProductCategoryError, string>({
    mutationFn: (id) => productCategoryService.deleteProductCategory(id),
    onSuccess: () => {
      // Invalidate productCategories list
      queryClient.invalidateQueries({
        queryKey: queryKeys.productCategories.all,
      });
    },
  });
};
