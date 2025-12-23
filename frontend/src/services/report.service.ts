import { apiClient } from "@/lib/apiClient";
import type { ReportResponse } from "../features/reports/types";

export const reportService = {
  getDailyReport: async (
    startDate: string,
    endDate: string
  ): Promise<ReportResponse> => {
    return apiClient(
      `/reports/daily?startDate=${startDate}&endDate=${endDate}`
    );
  },
};
