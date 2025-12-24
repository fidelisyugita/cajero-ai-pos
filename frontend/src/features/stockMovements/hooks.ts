import { useQuery } from "@tanstack/react-query";
import { stockMovementService } from "@/services/stockMovement.service";
import { queryKeys } from "@/lib/query-keys";

export const useStockMovements = (page = 0, size = 10) => {
  return useQuery({
    queryKey: queryKeys.stockMovements.list(page),
    queryFn: () => stockMovementService.getStockMovements(page, size),
  });
};
