import api from "@/lib/axios";
import type { ReportResponse } from "../types/Report";

export interface GetReportsParams {
    startDate: string;
    endDate: string;
}

export const getReports = async ({ startDate, endDate }: GetReportsParams): Promise<ReportResponse> => {
    const response = await api.get<ReportResponse>("/reports/daily", {
        params: {
            startDate,
            endDate,
        },
    });
    return response.data;
};
