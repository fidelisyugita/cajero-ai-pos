import { useInfiniteQuery } from "@tanstack/react-query";
import { LocalProductService } from "../LocalProductService";

export const useMenuProductsQuery = (categoryId?: string, search?: string) =>
	useInfiniteQuery({
		queryKey: ["menu-products", categoryId, search],
		queryFn: async ({ pageParam = 0 }) => {
			// Fetch from local DB
			const products = await LocalProductService.getProducts(search, categoryId, pageParam, 100); // Page size 100 is might still good for rendering
			return products;
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			// Check if we reached the end
			// Simplest way: if lastPage has less than limit, we are done.
			if (lastPage.length < 100) return undefined;
			return allPages.length; // Next page index
		},
	});
