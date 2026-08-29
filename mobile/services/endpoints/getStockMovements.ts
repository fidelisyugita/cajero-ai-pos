import api from "@/lib/axios";
import type { PageResponse } from "../types/Page";
import type { StockMovement } from "../types/StockMovement";

export type StockMovementPageResponse = PageResponse<StockMovement>;

export const getStockMovements = async (
  params?: Record<string, string | number | boolean | undefined>,
): Promise<StockMovementPageResponse> => {
  const response = await api.get<StockMovementPageResponse>("/stock-movement", { params });
  return response.data;
};

export type { StockMovement };
