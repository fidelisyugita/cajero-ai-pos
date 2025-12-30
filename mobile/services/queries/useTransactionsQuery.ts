import { useInfiniteQuery } from "@tanstack/react-query";
import { LocalTransactionService } from "../LocalTransactionService";
import { GetTransactionsParams, TransactionResponse } from "../types/Transaction";

export const useTransactionsQuery = (params: GetTransactionsParams = {}) => {
  return useInfiniteQuery({
    queryKey: ["transactions", params],
    queryFn: async ({ pageParam = 0 }) => {
      const transactions = await LocalTransactionService.getTransactions({
        ...params,
        page: pageParam,
        size: params.size || 20,
      });

      // Return object wrapping content for getNextPageParam compatibility or just array
      // Adapting to PageResponse-like structure or just array? 
      // LocalTransactionService returns array.
      return {
        content: transactions as any as TransactionResponse[], // Local service returns partial structure matching response
        totalElements: 0, // Not calculated
        totalPages: 100, // Dummy
        size: transactions.length,
        number: pageParam
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.size < (params.size || 20)) return undefined;
      return allPages.length;
    }
  });
};
