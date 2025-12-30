import api from "@/lib/axios";
import type {
	CreateProductRequest,
	Product,
} from "../types/Product";

export const postProduct = async (
	data: CreateProductRequest,
): Promise<Product> => {
	const response = await api.post<Product>("/product", data);
	return response.data;
};
