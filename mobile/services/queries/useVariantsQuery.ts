import { useQuery } from "@tanstack/react-query";
import { getVariants } from "../endpoints/getVariants";

export const useVariantsQuery = () => {
	return useQuery({
		queryKey: ["variants"],
		queryFn: getVariants,
	});
};
