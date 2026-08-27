import api from "@/lib/axios";
import Logger from "../logger";
import type { TransactionRequest, TransactionResponse } from "../types/Transaction";

export const postTransaction = async (data: TransactionRequest): Promise<TransactionResponse> => {
  Logger.log("TransactionRequest: ", JSON.stringify(data, null, 2));

  const response = await api.post<TransactionResponse>("/transaction", data);
  return response.data;
};
