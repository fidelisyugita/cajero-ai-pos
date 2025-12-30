import { useQuery } from "@tanstack/react-query";
import { getProductCategory } from "../endpoints/getProductCategory";

export const useProductCategoryQuery = () =>
	useQuery({
		queryKey: ["product-category"],
		queryFn: async () => {
			const categories = await getProductCategory();
			return [
				{
					code: "ALL",
					name: "All",
					storeId: "",
					description: "",
					createdBy: null,
					updatedBy: null,
					createdAt: "",
					updatedAt: "",
					deletedAt: null,
				},
				...categories,
			];
		},
	});

export const useCategoryQuery = () =>
	useQuery({
		queryKey: ["product-category"],
		queryFn: async () => {
			return await getProductCategory();
		},
	});
