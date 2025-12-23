import { useQuery } from "@tanstack/react-query";

import { reportService } from "@/services/report.service";

export const useDailyReport = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["reports", "daily", startDate, endDate],
    queryFn: () => reportService.getDailyReport(startDate, endDate),
  });
};

