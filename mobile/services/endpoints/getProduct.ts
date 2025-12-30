import api from "@/lib/axios";
import type { Product } from "../types/Product";

export const getProduct = async (id: string): Promise<Product> => {
	const response = await api.get<Product>(`/product/${id}`);
	return response.data;
};
