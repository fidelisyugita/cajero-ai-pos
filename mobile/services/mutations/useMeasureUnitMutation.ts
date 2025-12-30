import { useMutation } from "@tanstack/react-query";
import {
	type CreateMeasureUnitRequest,
	type MeasureUnit,
	postMeasureUnit,
} from "../endpoints/postMeasureUnit";

export function useAddMeasureUnitMutation() {
	return useMutation<MeasureUnit, Error, CreateMeasureUnitRequest>({
		mutationFn: (data: CreateMeasureUnitRequest) => postMeasureUnit(data),
		mutationKey: ["add-measure-unit"],
	});
}
