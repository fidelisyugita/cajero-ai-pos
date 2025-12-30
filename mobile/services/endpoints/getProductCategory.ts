import api from "@/lib/axios";
import type { ProductCategory } from "../types/ProductCategory";

export const getProductCategory = async (): Promise<ProductCategory[]> => {
	const response = await api.get<ProductCategory[]>("/product-category");
	return response.data;
};

export type { ProductCategory };
