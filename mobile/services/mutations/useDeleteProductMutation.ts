import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "../endpoints/deleteProduct";
import { LocalProductService } from "../LocalProductService";

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteProduct(id);
      await LocalProductService.softDeleteProduct(id);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-categories"] }); // In case category counts are affected
    },
  });
};
