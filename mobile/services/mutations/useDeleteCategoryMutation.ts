import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCategory } from "../endpoints/deleteCategory";

export const useDeleteCategoryMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (code: string) => deleteCategory(code),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["product-categories"] });
		},
	});
};
