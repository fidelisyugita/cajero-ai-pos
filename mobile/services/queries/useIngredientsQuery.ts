import { useQuery } from "@tanstack/react-query";
import { getIngredients } from "../endpoints/getIngredients";

export const useIngredientsQuery = () => {
	return useQuery({
		queryKey: ["ingredients"],
		queryFn: getIngredients,
	});
};
