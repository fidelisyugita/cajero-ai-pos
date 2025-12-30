import { useMutation } from "@tanstack/react-query";
import {
	type CreateIngredientRequest,
	type Ingredient,
	postIngredient,
} from "../endpoints/postIngredient";

export function useAddIngredientMutation() {
	return useMutation<Ingredient, Error, CreateIngredientRequest>({
		mutationFn: (data: CreateIngredientRequest) => postIngredient(data),
		mutationKey: ["add-ingredient"],
	});
}
