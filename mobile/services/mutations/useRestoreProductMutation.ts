import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restoreProduct } from "../endpoints/restoreProduct";
import { LocalProductService } from "../LocalProductService";

export const useRestoreProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await restoreProduct(id);
      await LocalProductService.restoreProduct(id);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
};
