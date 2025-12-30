import api from "@/lib/axios";

import type {
	GetProductsParams,
	ProductPageResponse,
} from "../types/Product";

export const getProducts = async (
	params: GetProductsParams,
): Promise<ProductPageResponse> => {
	const response = await api.get<ProductPageResponse>("/product", { params });
	return response.data;
};

export type { GetProductsParams, ProductPageResponse };
