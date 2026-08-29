import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LocalTransactionService } from "../LocalTransactionService";
import Logger from "../logger";
import { SyncService } from "../SyncService";
import type { TransactionRequest } from "../types/Transaction";

export const useCreateTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TransactionRequest) => {
      const result = await LocalTransactionService.createTransaction(data);
      // Optionally trigger sync immediately
      SyncService.pushTransactions().catch((e) => Logger.error("Push transaction failed", e));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // To update stock
    },
  });
};
