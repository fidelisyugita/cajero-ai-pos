import { useQuery } from "@tanstack/react-query";
import { getProductCategory } from "../endpoints/getProductCategory";

export const useProductCategoriesQuery = () => {
	return useQuery({
		queryKey: ["product-categories"],
		queryFn: getProductCategory,
	});
};
