import { useQuery } from "@tanstack/react-query";
import { LocalProductService } from "../LocalProductService";
import { GetProductsParams, Product } from "../types/Product";

export const useProductsQuery = (params: GetProductsParams) => {
	return useQuery({
		queryKey: ["products", params],
		queryFn: async () => {
			// For non-infinite lists, we fetch a large chunk.
			const products = await LocalProductService.getProducts(
				params.keyword,
				params.categoryCode,
				0,
				1000,
				params.includeDeleted
			);
			// Adapter to match PageResponse structure expected by UI
			return {
				content: products as unknown as Product[], // Cast or map if needed
				totalElements: products.length,
				totalPages: 1,
				size: products.length,
				number: 0,
			};
		},
	});
};
