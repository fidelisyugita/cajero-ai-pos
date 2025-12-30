import api from "@/lib/axios";
import type { StockMovement } from "../types/StockMovement";

export const getStockMovements = async (params?: Record<string, any>): Promise<any> => {
	const response = await api.get<any>("/stock-movement", { params });
	return response.data;
};

export type { StockMovement };
