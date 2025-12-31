import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stockUpdate } from "../endpoints/stockUpdate";
import Logger from "../logger";

export const useUpdateVariantStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stock, reason }: { id: string; stock: number; reason?: string }) => {
      Logger.log("Updating variant stock:", { id, stock, reason });
      return stockUpdate({
        id,
        type: "VARIANT",
        newStock: stock,
        reason
      });
    },
    onSuccess: async (_, variables) => {
      // For now we just invalidate variants queries
      // If we had a local DB table for variants, we would update it here like in useUpdateProductStockMutation
      
      queryClient.invalidateQueries({ queryKey: ["variants"] });
    },
    onError: (error: any) => {
      Logger.error("Failed to update variant stock:", error);
      if (error.response) {
        Logger.error("Error data:", error.response.data);
        Logger.error("Error status:", error.response.status);
      }
    }
  });
};
