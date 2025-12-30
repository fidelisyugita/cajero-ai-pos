import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct } from "../endpoints/updateProduct";
import type { CreateProductRequest } from "../types/Product";
import Logger from "../logger";

import { db } from "@/db/drizzle";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export const useUpdateProductMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateProductRequest }) => {
            Logger.log("Updating product with payload:", JSON.stringify(data, null, 2));
            return updateProduct(id, data);
        },
        onSuccess: async (updatedProduct) => {
            Logger.log("Update success! Backend returned stock:", updatedProduct.stock);
            // Update local DB
            try {
                await db.update(products).set({
                    stock: updatedProduct.stock,
                    categoryId: updatedProduct.categoryCode, // Ensure other fields are synced if needed
                    name: updatedProduct.name,
                    sellingPrice: updatedProduct.sellingPrice,
                    buyingPrice: updatedProduct.buyingPrice,
                    updatedAt: new Date()
                }).where(eq(products.id, updatedProduct.id));
            } catch (e) {
                Logger.error("Failed to update local db product:", e);
            }

            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product", updatedProduct.id] });
        },
        onError: (error: any) => {
            Logger.error("Failed to update product:", error);
            if (error.response) {
                Logger.error("Error data:", error.response.data);
                Logger.error("Error status:", error.response.status);
            }
        }
    });
};
