import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { products } from "@/db/schema";
import { nowDate } from "@/utils/Date";
import { stockUpdate } from "../endpoints/stockUpdate";
import Logger from "../logger";

export const useUpdateProductStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stock, reason }: { id: string; stock: number; reason?: string }) => {
      Logger.log("Updating product stock:", { id, stock, reason });
      return stockUpdate({
        id,
        type: "PRODUCT",
        newStock: stock,
        reason,
      });
    },
    onSuccess: async (_, variables) => {
      Logger.log("Stock update success. Updating local DB with new stock:", variables.stock);
      // Update local DB
      try {
        await db
          .update(products)
          .set({
            stock: variables.stock,
            updatedAt: nowDate(),
          })
          .where(eq(products.id, variables.id));
      } catch (e) {
        Logger.error("Failed to update local db product:", e);
      }

      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
    },
    onError: (error: unknown) => {
      Logger.error("Failed to update product stock:", error);
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosErr = error as { response?: { data?: unknown; status?: number } };
        if (axiosErr.response) {
          Logger.error("Error data:", axiosErr.response.data);
          Logger.error("Error status:", axiosErr.response.status);
        }
      }
    },
  });
};
