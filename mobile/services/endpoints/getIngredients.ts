import api from "@/lib/axios";
import type { Ingredient } from "../types/Ingredient";

export const getIngredients = async (): Promise<Ingredient[]> => {
	const response = await api.get<Ingredient[]>("/ingredient");
	return response.data;
};

export type { Ingredient };
