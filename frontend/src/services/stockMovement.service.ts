import { apiClient } from "@/lib/apiClient";
import type { StockMovement } from "@/types/api";

export const stockMovementService = {
  getStockMovements: async (page = 0, size = 10): Promise<StockMovement[]> => {
    // Note: Backend currently returns List, not Page. Params kept for interface consistency.
    return apiClient(`/stock-movement?page=${page}&size=${size}`);
  },

  getStockMovement: async (id: string): Promise<StockMovement> => {
    return apiClient(`/stock-movement/${id}`);
  },
};
