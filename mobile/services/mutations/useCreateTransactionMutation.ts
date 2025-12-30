import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LocalTransactionService } from "../LocalTransactionService";
import { SyncService } from "../SyncService";
import Logger from "../logger";

export const useCreateTransactionMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: any) => {
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
