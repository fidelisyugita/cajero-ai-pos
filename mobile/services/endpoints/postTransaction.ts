import api from "@/lib/axios";
import { TransactionRequest, TransactionResponse } from "../types/Transaction";
import Logger from "../logger";

export const postTransaction = async (
	data: TransactionRequest,
): Promise<TransactionResponse> => {
	Logger.log('TransactionRequest: ', JSON.stringify(data, null, 2));

	const response = await api.post<TransactionResponse>("/transaction", data);
	return response.data;
};
