import { apiClient } from "@/lib/apiClient";
import type { Log } from "@/types/api";

export type LogResponse = {
  content: Log[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export type LogError = {
  message: string;
  status: number;
};

export const logService = {
  getLogs: async (page: number): Promise<LogResponse> => {
    return apiClient(`/log?page=${page}`);
  },
};
