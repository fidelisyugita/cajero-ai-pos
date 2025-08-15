import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { PaginatedResponse, Transaction } from "@/types/api";

export const useTransactions = (page: number = 0) => {
  return useQuery<PaginatedResponse<Transaction>>({
    queryKey: ["transactions", page],
    queryFn: () => apiClient(`/api/transaction?page=${page}&size=10`),
  });
};
