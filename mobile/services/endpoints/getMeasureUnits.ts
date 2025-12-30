import api from "@/lib/axios";
import type { MeasureUnit } from "../types/MeasureUnit";

export const getMeasureUnits = async (): Promise<MeasureUnit[]> => {
	const response = await api.get<MeasureUnit[]>("/measure-unit");
	return response.data;
};

export type { MeasureUnit };
