import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Log, PaginatedResponse } from "@/types/api";
import { logService } from "@/services/log.service";

export const useLogs = (page: number = 0) => {
  return useQuery<PaginatedResponse<Log>>({
    queryKey: queryKeys.logs.list(page),
    queryFn: () => logService.getLogs(page),
  });
};
