import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stockUpdate } from "../endpoints/stockUpdate";
import Logger from "../logger";

import { db } from "@/db/drizzle";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export const useUpdateProductStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stock, reason }: { id: string; stock: number; reason?: string }) => {
      Logger.log("Updating product stock:", { id, stock, reason });
      return stockUpdate({
        id,
        type: "PRODUCT",
        newStock: stock,
        reason
      });
    },
    onSuccess: async (_, variables) => {
      Logger.log("Stock update success. Updating local DB with new stock:", variables.stock);
      // Update local DB
      try {
        await db.update(products).set({
          stock: variables.stock,
          updatedAt: new Date()
        }).where(eq(products.id, variables.id));
      } catch (e) {
        Logger.error("Failed to update local db product:", e);
      }

      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
    },
    onError: (error: any) => {
      Logger.error("Failed to update product stock:", error);
      if (error.response) {
        Logger.error("Error data:", error.response.data);
        Logger.error("Error status:", error.response.status);
      }
    }
  });
};
