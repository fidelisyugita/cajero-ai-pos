import api from "@/lib/axios";
import type { CreateIngredientRequest, Ingredient } from "../types/Ingredient";

export const putIngredient = async (
  id: string,
  data: CreateIngredientRequest,
): Promise<Ingredient> => {
  const response = await api.put<Ingredient>(`/ingredient/${id}`, data);
  return response.data;
};
