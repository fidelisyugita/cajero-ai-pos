import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postProductCategory } from "../endpoints/postProductCategory";
import type { CreateProductCategoryRequest } from "../types/ProductCategory";

export const useCreateProductCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductCategoryRequest) => postProductCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
    },
  });
};
