import { useMutation, useQueryClient } from "@tanstack/react-query";
import { putIngredient } from "../endpoints/putIngredient";
import Logger from "../logger";
import type { CreateIngredientRequest } from "../types/Ingredient";

export const useUpdateIngredientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateIngredientRequest }) =>
      putIngredient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
    onError: (error) => {
      Logger.error("Failed to update ingredient:", error);
    },
  });
};
