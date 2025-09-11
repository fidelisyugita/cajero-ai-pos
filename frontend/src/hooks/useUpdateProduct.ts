import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Product } from "@/types/api";

export const useUpdateProduct = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      // const formData = new FormData();
      // formData.append("name", data.name);
      // formData.append("description", data.description);
      // formData.append("stock", data.stock.toString());
      // formData.append("buyingPrice", data.buyingPrice.toString());
      // formData.append("sellingPrice", data.sellingPrice.toString());

      // if (data.imageFile) {
      //   formData.append("image", data.imageFile);
      // }

      const response = await apiClient(`/product/${id}`, {
        method: "PUT",
        // data: formData,
        data: data,
      });
      return response as Product;
    },
    onSuccess: () => {
      // Invalidate the product query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
