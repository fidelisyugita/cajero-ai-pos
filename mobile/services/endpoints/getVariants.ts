import api from "@/lib/axios";
import type { Variant } from "../types/Variant";

export const getVariants = async (): Promise<Variant[]> => {
	const response = await api.get<Variant[]>("/variant");
	return response.data;
};
