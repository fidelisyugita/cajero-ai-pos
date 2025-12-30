import { useInfiniteQuery } from "@tanstack/react-query";
import { getStockMovements } from "../endpoints/getStockMovements";

export const useStockMovementsQuery = (params: Record<string, any> = {}) => {
	return useInfiniteQuery({
		queryKey: ["stock-movements", params],
		queryFn: ({ pageParam = 0 }) => getStockMovements({ ...params, page: pageParam }),
		initialPageParam: 0,
		getNextPageParam: (lastPage: any) => {
			if (lastPage.last) return undefined;
			if (lastPage.number + 1 < lastPage.totalPages) return lastPage.number + 1;
			return undefined;
		},
	});
};
