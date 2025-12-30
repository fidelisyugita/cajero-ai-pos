import { useQuery } from "@tanstack/react-query";
import { getMeasureUnits } from "../endpoints/getMeasureUnits";

export const useMeasureUnitsQuery = () => {
	return useQuery({
		queryKey: ["measure-units"],
		queryFn: getMeasureUnits,
	});
};
