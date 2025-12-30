import { useQuery } from "@tanstack/react-query";
import { getProduct } from "../endpoints/getProduct";

export const useProductQuery = (id: string, enabled = true) => {
	return useQuery({
		queryKey: ["product", id],
		queryFn: () => getProduct(id),
		enabled: !!id && enabled,
	});
};
