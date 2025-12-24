import { apiClient } from "@/lib/apiClient";
import type { StockMovement } from "@/types/api";

export const stockMovementService = {
  getStockMovements: async (
    page = 0,
    size = 10,
    startDate?: string,
    endDate?: string,
    ingredientId?: string,
    productId?: string,
    type?: string
  ): Promise<any> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (ingredientId) params.append("ingredientId", ingredientId);
    if (productId) params.append("productId", productId);
    if (type) params.append("type", type);

    const qs = params.toString();
    return apiClient(`/stock-movement?${qs}`);
  },

  getStockMovement: async (id: string): Promise<StockMovement> => {
    return apiClient(`/stock-movement/${id}`);
  },
};
