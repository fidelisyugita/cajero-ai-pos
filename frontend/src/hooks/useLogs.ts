import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { PaginatedResponse, Log } from "@/types/api";

export const useLogs = (page: number = 0, size: number = 20) => {
  return useQuery<PaginatedResponse<Log>>({
    queryKey: ["logs", page],
    queryFn: () => apiClient(`/log?page=${page}&size=${size}`),
  });
};
