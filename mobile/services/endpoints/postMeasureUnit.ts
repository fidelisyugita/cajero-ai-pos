import api from "@/lib/axios";
import type {
	CreateMeasureUnitRequest,
	MeasureUnit,
} from "../types/MeasureUnit";

export const postMeasureUnit = async (
	data: CreateMeasureUnitRequest,
): Promise<MeasureUnit> => {
	const response = await api.post<MeasureUnit>(
		"/measure-unit",
		data,
	);
	return response.data;
};

export type { CreateMeasureUnitRequest, MeasureUnit };
