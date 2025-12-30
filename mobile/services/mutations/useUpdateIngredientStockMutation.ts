import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stockUpdate } from "../endpoints/stockUpdate";
import Logger from "../logger";

export const useUpdateIngredientStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stock, reason }: { id: string; stock: number; reason?: string }) =>
      stockUpdate({
        id,
        type: "INGREDIENT",
        newStock: stock,
        reason
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
    onError: (error) => {
      Logger.error("Failed to update ingredient stock:", error);
    }
  });
};
