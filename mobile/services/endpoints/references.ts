import api from "@/lib/axios";
import type {
	PaymentMethodRef,
	TransactionStatusRef,
	TransactionTypeRef,
} from "../types/Transaction";

export const getTransactionTypes = async (): Promise<TransactionTypeRef[]> => {
	const response = await api.get<TransactionTypeRef[]>("/transaction-type");
	return response.data;
};

export const getPaymentMethods = async (): Promise<PaymentMethodRef[]> => {
	const response = await api.get<PaymentMethodRef[]>("/payment-method");
	return response.data;
};

export const getTransactionStatuses = async (): Promise<
	TransactionStatusRef[]
> => {
	const response = await api.get<TransactionStatusRef[]>("/transaction-status");
	return response.data;
};
