import api from "@/lib/axios";
import type { GetTransactionsParams, TransactionPageResponse } from "../types/Transaction";

export const getTransactions = async (
  params: GetTransactionsParams = {},
): Promise<TransactionPageResponse> => {
  const response = await api.get<TransactionPageResponse>("/transaction", {
    params,
  });
  return response.data;
};
