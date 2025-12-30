import api from "@/lib/axios";
import type {
	CreateIngredientRequest,
	Ingredient,
} from "../types/Ingredient";

export const postIngredient = async (
	data: CreateIngredientRequest,
): Promise<Ingredient> => {
	const response = await api.post<Ingredient>("/ingredient", data);
	return response.data;
};

export type { CreateIngredientRequest, Ingredient };
