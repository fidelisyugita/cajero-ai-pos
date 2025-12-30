import { useQuery } from "@tanstack/react-query";
import { LocalTransactionService } from "../LocalTransactionService";

export const useTransactionQuery = (id: string) => {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: () => LocalTransactionService.getTransactionById(id),
    enabled: !!id,
  });
};
