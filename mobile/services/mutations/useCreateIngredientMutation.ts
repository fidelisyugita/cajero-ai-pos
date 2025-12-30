import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postIngredient } from "../endpoints/postIngredient";
import { CreateIngredientRequest } from "../types/Ingredient";

export const useCreateIngredientMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateIngredientRequest) => postIngredient(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ingredients"] });
        },
    });
};
