import api from "@/lib/axios";
import type { CreateProductRequest, Product } from "../types/Product";

export const updateProduct = async (
	id: string,
	data: CreateProductRequest,
): Promise<Product> => {
	const response = await api.put<Product>(`/product/${id}`, data);
	return response.data;
};
