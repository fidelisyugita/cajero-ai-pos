import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  transactionService,
  type TransactionError,
} from "@/services/transaction.service";
import { queryKeys } from "@/lib/query-keys";
import type { Transaction } from "@/types/api";

export const useTransactions = (page: number = 0) => {
  return useQuery({
    queryKey: queryKeys.transactions.list(page),
    queryFn: () => transactionService.getTransactions(page),
  });
};

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: queryKeys.transactions.detail(id),
    queryFn: () => transactionService.getTransaction(id),
    enabled: !!id,
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Transaction,
    TransactionError,
    { id: string; data: Partial<Transaction> }
  >({
    mutationFn: ({ id, data }) =>
      transactionService.updateTransaction(id, data),
    onSuccess: (updatedTransaction) => {
      // Invalidate specific transaction query
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.detail(updatedTransaction.id),
      });
      // Invalidate transactions list
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<Transaction, TransactionError, Omit<Transaction, "id">>({
    mutationFn: (data) => transactionService.createTransaction(data),
    onSuccess: () => {
      // Invalidate transactions list
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<void, TransactionError, string>({
    mutationFn: (id) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      // Invalidate transactions list
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
    },
  });
};
