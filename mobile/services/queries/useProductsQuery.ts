import { useQuery } from "@tanstack/react-query";
import { LocalProductService } from "../LocalProductService";
import type { GetProductsParams, Product } from "../types/Product";

const EMPTY_PARAMS: Partial<GetProductsParams> = {};
const PRODUCTS_STALE_TIME = 5 * 60_000;

export const useProductsQuery = (params: Partial<GetProductsParams> = EMPTY_PARAMS) => {
  return useQuery({
    queryKey: ["products", params],
    staleTime: PRODUCTS_STALE_TIME,
    queryFn: async () => {
      const page = params.page ?? 0;
      const size = params.size ?? 1000;
      const products = await LocalProductService.getProducts(
        params.keyword,
        params.categoryCode,
        page,
        size,
        params.includeDeleted,
      );
      // Adapter to match PageResponse structure expected by UI
      return {
        content: products as unknown as Product[], // Cast or map if needed
        totalElements: products.length,
        totalPages: 1,
        size: products.length,
        number: page,
      };
    },
  });
};
