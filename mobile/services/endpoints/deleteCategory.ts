import api from "@/lib/axios";
import type { ProductCategory } from "../types/ProductCategory";

export const deleteCategory = async (code: string): Promise<ProductCategory> => {
	const response = await api.delete<ProductCategory>(`/product-category/${code}`);
	return response.data;
};
