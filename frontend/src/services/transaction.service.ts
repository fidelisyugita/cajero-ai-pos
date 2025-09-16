import { apiClient } from "@/lib/apiClient";
import type { Transaction } from "@/types/api";

export type TransactionResponse = {
  content: Transaction[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export type TransactionError = {
  message: string;
  status: number;
};

export const transactionService = {
  getTransactions: async (page: number): Promise<TransactionResponse> => {
    return apiClient(`/transaction?page=${page}`);
  },

  getTransaction: async (id: string): Promise<Transaction> => {
    return apiClient(`/transaction/${id}`);
  },

  updateTransaction: async (
    id: string,
    data: Partial<Transaction>
  ): Promise<Transaction> => {
    return apiClient(`/transaction/${id}`, {
      method: "PUT",
      data,
    });
  },

  createTransaction: async (
    data: Omit<Transaction, "id">
  ): Promise<Transaction> => {
    return apiClient("/transaction", {
      method: "POST",
      data,
    });
  },

  deleteTransaction: async (id: string): Promise<void> => {
    return apiClient(`/transaction/${id}`, {
      method: "DELETE",
    });
  },
};
