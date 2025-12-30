import api from "@/lib/axios";

export interface StockUpdateRequest {
  id: string;
  type: "INGREDIENT" | "PRODUCT";
  newStock: number;
  reason?: string;
}

export const stockUpdate = async (data: StockUpdateRequest): Promise<void> => {
  await api.post("/stock-update", data);
};
