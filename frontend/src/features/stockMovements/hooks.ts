import { useQuery } from "@tanstack/react-query";
import { stockMovementService } from "@/services/stockMovement.service";
import { queryKeys } from "@/lib/query-keys";

export const useStockMovements = (
  page = 0,
  size = 10,
  filters?: {
    startDate?: string;
    endDate?: string;
    ingredientId?: string;
    productId?: string;
    type?: string;
  }
) => {
  return useQuery({
    queryKey: queryKeys.stockMovements.list(page, filters),
    queryFn: () =>
      stockMovementService.getStockMovements(
        page,
        size,
        filters?.startDate,
        filters?.endDate,
        filters?.ingredientId,
        filters?.productId,
        filters?.type
      ),
  });
};
