import api from "@/lib/axios";
import { db } from "@/db/drizzle";
import { categories, products, productIngredients, syncStatus, transactions, transactionItems } from "@/db/schema";
import { eq } from "drizzle-orm";

// Helper for UUID generation
const generateUUID = () => {
  // @ts-ignore
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

import { useAuthStore } from "@/store/useAuthStore";
import Logger from "./logger";

export const SyncService = {
  async syncProducts() {
    const { isLoggedIn, user } = useAuthStore.getState();
    if (!isLoggedIn || !user?.accessToken) return false;

    try {
      // Fetch from API
      // Note: Fetching all products might need pagination handling if list is huge.
      // For now, let's request a large size.
      const response = await api.get("/product?size=1000&includeDeleted=true");
      const backendProducts = response.data.content; // Page response

      // Upsert to Local DB
      await db.transaction(async (tx) => {
        for (const p of backendProducts) {
          await tx.insert(products).values({
            id: p.id,
            name: p.name,
            description: p.description,
            sellingPrice: p.sellingPrice,
            buyingPrice: p.buyingPrice,
            stock: p.stock,
            categoryId: p.categoryCode, // Backend uses categoryCode
            imageUrl: p.imageUrl,
            barcode: p.barcode,
            tax: p.tax,
            commission: p.commission,
            discount: p.discount,
            measureUnitCode: p.measureUnitCode,
            measureUnitName: p.measureUnitName,
            createdAt: p.createdAt ? new Date(p.createdAt) : null,
            updatedAt: p.updatedAt ? new Date(p.updatedAt) : null,
            deletedAt: p.deletedAt ? new Date(p.deletedAt) : null,
          }).onConflictDoUpdate({
            target: products.id,
            set: {
              name: p.name,
              description: p.description,
              sellingPrice: p.sellingPrice,
              buyingPrice: p.buyingPrice,
              stock: p.stock,
              categoryId: p.categoryCode,
              imageUrl: p.imageUrl,
              barcode: p.barcode,
              tax: p.tax,
              commission: p.commission,
              discount: p.discount,
              measureUnitCode: p.measureUnitCode,
              measureUnitName: p.measureUnitName,
              updatedAt: p.updatedAt ? new Date(p.updatedAt) : null,
              deletedAt: p.deletedAt ? new Date(p.deletedAt) : null,
            }
          });

          // Sync Ingredients
          if (p.ingredients) {
            // Clear existing to avoid stale data
            await tx.delete(productIngredients).where(eq(productIngredients.productId, p.id));

            for (const ing of p.ingredients) {
              await tx.insert(productIngredients).values({
                productId: p.id,
                ingredientId: ing.ingredientId,
                name: ing.name,
                stock: ing.stock, // stock of ingredient at that time?
                measureUnitCode: ing.measureUnitCode,
                measureUnitName: ing.measureUnitName,
                quantityNeeded: ing.quantityNeeded,
              });
            }
          }
        }
      });

      await db.insert(syncStatus).values({ tableName: "products", lastSync: new Date() })
        .onConflictDoUpdate({ target: syncStatus.tableName, set: { lastSync: new Date() } });

      return true;
    } catch (error) {
      Logger.error("Sync products failed:", error);
      return false;
    }
  },

  async syncCategories() {
    const { isLoggedIn, user } = useAuthStore.getState();
    if (!isLoggedIn || !user?.accessToken) return false;

    try {
      const response = await api.get("/product-category");
      const backendCategories = response.data;

      await db.transaction(async (tx) => {
        for (const c of backendCategories) {
          await tx.insert(categories).values({
            id: c.code, // Backend uses code as ID for categories in response?
            name: c.name,
            description: c.description,
            createdAt: c.createdAt ? new Date(c.createdAt) : null,
            updatedAt: c.updatedAt ? new Date(c.updatedAt) : null,
            deletedAt: c.deletedAt ? new Date(c.deletedAt) : null,
          }).onConflictDoUpdate({
            target: categories.id,
            set: {
              name: c.name,
              description: c.description,
              updatedAt: c.updatedAt ? new Date(c.updatedAt) : null,
              deletedAt: c.deletedAt ? new Date(c.deletedAt) : null,
            }
          });
        }
      });
      return true;
    } catch (error) {
      Logger.error("Sync categories failed:", error);
      return false;
    }
  },

  async syncTransactions() {
    const { isLoggedIn, user } = useAuthStore.getState();
    if (!isLoggedIn || !user?.accessToken) return false;

    try {
      // Fetch recent transactions (e.g. last 100 or via date range of last week/month)
      // For simplicity, let's fetch last 100.
      const response = await api.get("/transaction?size=100&sort=createdAt,desc");
      const backendTransactions = response.data.content;

      await db.transaction(async (tx) => {
        for (const t of backendTransactions) {
          // Check if exists? Or onConflictDoUpdate.
          // If we trust backend as source of truth for history.

          await tx.insert(transactions).values({
            id: t.id,
            storeId: t.storeId,
            customerId: t.customerId || null,
            totalPrice: t.totalPrice,
            totalTax: t.totalTax,
            totalDiscount: t.totalDiscount,
            totalCommission: t.totalCommission,
            paymentMethodCode: t.paymentMethodCode,
            transactionTypeCode: t.transactionTypeCode,
            statusCode: t.statusCode,
            isIn: t.in, // mapped from 'is_in' to 'in' in backend response usually, check backend DTO.
            // TransactionResponse in backend has `in` boolean field.
            description: t.description,
            isSynced: true, // From backend means it is synced
            createdAt: t.createdAt ? new Date(t.createdAt) : null,
          }).onConflictDoUpdate({
            target: transactions.id,
            set: {
              statusCode: t.statusCode, // Update status if changed
              customerId: t.customerId || null,
              description: t.description,
              isSynced: true
            }
          });

          // Insert Items
          // We need to clear existing for this transaction to avoid dups or handle carefully.
          // Easiest is delete and re-insert for items of this transaction, or ignore if exists.
          // transactionProduct is the list in response.

          if (t.transactionProduct) {
            // Delete existing items for this transaction to ensure fresh state
            await tx.delete(transactionItems).where(eq(transactionItems.transactionId, t.id));

            for (const item of t.transactionProduct) {
              await tx.insert(transactionItems).values({
                id: item.id || generateUUID(), // Item ID might be missing or we generate one
                transactionId: t.id,
                productId: item.productId,
                quantity: item.quantity,
                sellingPrice: item.sellingPrice,
                buyingPrice: item.buyingPrice,
                tax: item.tax,
                commission: item.commission,
                discount: item.discount,
                note: item.note,
                selectedVariants: JSON.stringify(item.selectedVariants),
                productName: item.name
              });
            }
          }
        }
      });
      await db.insert(syncStatus).values({ tableName: "transactions", lastSync: new Date() })
        .onConflictDoUpdate({ target: syncStatus.tableName, set: { lastSync: new Date() } });

      return true;
    } catch (error) {
      Logger.error("Sync transactions failed:", error);
      return false;
    }
  },

  async pushTransactions() {
    const { isLoggedIn, user } = useAuthStore.getState();
    if (!isLoggedIn || !user?.accessToken) return false;

    try {
      // Get unsynced transactions
      const unsynced = await db.select().from(transactions).where(eq(transactions.isSynced, false));

      for (const txn of unsynced) {
        const items = await db.select().from(transactionItems).where(eq(transactionItems.transactionId, txn.id));

        const payload = {
          storeId: txn.storeId,
          customerId: txn.customerId || undefined, // Backend might expect undefined if null
          totalPrice: txn.totalPrice,
          totalTax: txn.totalTax,
          totalDiscount: txn.totalDiscount,
          totalCommission: txn.totalCommission,
          paymentMethodCode: txn.paymentMethodCode,
          transactionTypeCode: txn.transactionTypeCode,
          statusCode: txn.statusCode,
          // Map 'isIn' to 'in' if backend expects 'in' (common with Lombok/Jackson boolean isIn)
          in: txn.isIn,
          description: txn.description,
          transactionProducts: items.map(i => {
            let parsedVariants = i.selectedVariants;
            if (typeof i.selectedVariants === 'string') {
              try {
                parsedVariants = JSON.parse(i.selectedVariants);
              } catch (e) {
                Logger.error("Failed to parse selectedVariants", e);
                parsedVariants = null;
              }
            }
            return {
              productId: i.productId,
              quantity: i.quantity,
              sellingPrice: i.sellingPrice,
              buyingPrice: i.buyingPrice || 0,
              commission: i.commission || 0,
              discount: i.discount || 0,
              tax: i.tax || 0,
              note: i.note,
              selectedVariants: parsedVariants
            };
          }),
          // createdAt: txn.createdAt // Backend usually ignores or auto-sets this on POST
        };

        // Send to API
        await api.post("/transaction", payload); // Verify endpoint: postTransaction.ts uses /transaction singular

        // Mark as synced
        await db.update(transactions).set({ isSynced: true }).where(eq(transactions.id, txn.id));
      }
      return true;
    } catch (error) {
      Logger.error("Push transactions failed:", error);
      return false;
    }
  },

  async syncAll() {
    await this.syncCategories();
    await this.syncProducts();
    // Sync Logic:
    // 1. Push local changes first (unsynced) to update backend.
    // 2. Pull latest from backend to update local.
    await this.pushTransactions();
    await this.syncTransactions();
  },

  async getUnsyncedCount() {
    try {
      const unsynced = await db.select().from(transactions).where(eq(transactions.isSynced, false));
      return unsynced.length;
    } catch (e) {
      Logger.error("Failed to get unsynced count", e);
      return 0;
    }
  }
};
