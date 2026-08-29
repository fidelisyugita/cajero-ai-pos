import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import {
  categories,
  productIngredients,
  products,
  syncStatus,
  transactionItems,
  transactions,
} from "@/db/schema";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { nowDate, toDate } from "@/utils/Date";
import { generateUUID } from "@/utils/Uuid";
import Logger from "./logger";
import type { ProductIngredient } from "./types/Product";
import type { TransactionProductResponse, TransactionResponse } from "./types/Transaction";

// Drizzle transaction callback parameter type
type DrizzleTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Backend API shape for a product category */
interface CategoryResponse {
  code: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

/** Backend API shape for a product (from /product endpoint) */
interface ProductApiResponse {
  id: string;
  name: string;
  description?: string;
  sellingPrice: number;
  buyingPrice?: number;
  stock?: number;
  categoryCode: string;
  imageUrl?: string;
  barcode?: string;
  tax?: number;
  commission?: number;
  discount?: number;
  measureUnitCode?: string;
  measureUnitName?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  ingredients?: ProductIngredient[];
}

async function syncProductIngredients(
  tx: DrizzleTx,
  productId: string,
  ingredients: ProductIngredient[],
): Promise<void> {
  await tx.delete(productIngredients).where(eq(productIngredients.productId, productId));
  for (const ing of ingredients) {
    await tx.insert(productIngredients).values({
      productId,
      ingredientId: ing.ingredientId,
      name: ing.name,
      stock: ing.stock,
      measureUnitCode: ing.measureUnitCode,
      measureUnitName: ing.measureUnitName,
      quantityNeeded: ing.quantityNeeded,
    });
  }
}

async function upsertSingleProduct(tx: DrizzleTx, p: ProductApiResponse): Promise<void> {
  const createdAt = toDate(p.createdAt);
  const updatedAt = toDate(p.updatedAt);
  const deletedAt = toDate(p.deletedAt);

  await tx
    .insert(products)
    .values({
      id: p.id,
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
      createdAt,
      updatedAt,
      deletedAt,
    })
    .onConflictDoUpdate({
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
        updatedAt,
        deletedAt,
      },
    });

  if (p.ingredients) {
    await syncProductIngredients(tx, p.id, p.ingredients);
  }
}

async function upsertSingleCategory(tx: DrizzleTx, c: CategoryResponse): Promise<void> {
  const createdAt = toDate(c.createdAt);
  const updatedAt = toDate(c.updatedAt);
  const deletedAt = toDate(c.deletedAt);

  await tx
    .insert(categories)
    .values({
      id: c.code,
      name: c.name,
      description: c.description,
      createdAt,
      updatedAt,
      deletedAt,
    })
    .onConflictDoUpdate({
      target: categories.id,
      set: {
        name: c.name,
        description: c.description,
        updatedAt,
        deletedAt,
      },
    });
}

async function syncTransactionItems(
  tx: DrizzleTx,
  transactionId: string,
  items: TransactionProductResponse[],
): Promise<void> {
  await tx.delete(transactionItems).where(eq(transactionItems.transactionId, transactionId));
  for (const item of items) {
    await tx.insert(transactionItems).values({
      id: generateUUID(),
      transactionId,
      productId: item.productId,
      quantity: item.quantity,
      sellingPrice: item.sellingPrice ?? item.price ?? 0,
      buyingPrice: item.buyingPrice ?? null,
      tax: item.tax ?? null,
      commission: item.commission ?? null,
      discount: item.discount ?? null,
      note: item.note ?? null,
      selectedVariants: JSON.stringify(item.selectedVariants),
      productName: item.name ?? item.productName ?? null,
    });
  }
}

async function upsertSingleTransaction(tx: DrizzleTx, t: TransactionResponse): Promise<void> {
  await tx
    .insert(transactions)
    .values({
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
      isIn: t.in,
      description: t.description,
      isSynced: true,
      createdAt: toDate(t.createdAt),
    })
    .onConflictDoUpdate({
      target: transactions.id,
      set: {
        statusCode: t.statusCode,
        customerId: t.customerId || null,
        description: t.description,
        isSynced: true,
      },
    });

  if (t.transactionProduct) {
    await syncTransactionItems(tx, t.id, t.transactionProduct);
  }
}

function parseSelectedVariants(rawVariants: unknown): unknown {
  if (typeof rawVariants !== "string") return rawVariants;
  try {
    return JSON.parse(rawVariants);
  } catch (e) {
    Logger.error("Failed to parse selectedVariants", e);
    return null;
  }
}

/** Row type as returned by drizzle select from transactionItems */
type TransactionItemRow = typeof transactionItems.$inferSelect;

function mapTransactionProduct(item: TransactionItemRow) {
  return {
    productId: item.productId,
    quantity: item.quantity,
    sellingPrice: item.sellingPrice,
    buyingPrice: item.buyingPrice || 0,
    commission: item.commission || 0,
    discount: item.discount || 0,
    tax: item.tax || 0,
    note: item.note,
    selectedVariants: parseSelectedVariants(item.selectedVariants),
  };
}

async function handlePostPushSync(
  tx: DrizzleTx,
  localTxnId: string,
  backendTxn: TransactionResponse,
): Promise<void> {
  const existing = await tx.select().from(transactions).where(eq(transactions.id, backendTxn.id));

  if (existing.length > 0) {
    await tx.delete(transactionItems).where(eq(transactionItems.transactionId, localTxnId));
    await tx.delete(transactions).where(eq(transactions.id, localTxnId));
    return;
  }

  await tx
    .update(transactionItems)
    .set({ transactionId: backendTxn.id })
    .where(eq(transactionItems.transactionId, localTxnId));

  await tx
    .update(transactions)
    .set({
      id: backendTxn.id,
      totalPrice: backendTxn.totalPrice,
      totalTax: backendTxn.totalTax,
      totalDiscount: backendTxn.totalDiscount,
      totalCommission: backendTxn.totalCommission,
      isSynced: true,
      createdAt: toDate(backendTxn.createdAt) || nowDate(),
    })
    .where(eq(transactions.id, localTxnId));
}

export const SyncService = {
  async syncProducts() {
    const { isLoggedIn, user } = useAuthStore.getState();
    if (!(isLoggedIn && user?.accessToken)) return false;

    try {
      // Fetch from API
      // Note: Fetching all products might need pagination handling if list is huge.
      // For now, let's request a large size.
      const response = await api.get("/product?size=1000&includeDeleted=true");
      const backendProducts = response.data.content; // Page response

      // Upsert to Local DB
      await db.transaction(async (tx) => {
        for (const p of backendProducts) {
          await upsertSingleProduct(tx, p);
        }
      });

      await db
        .insert(syncStatus)
        .values({ tableName: "products", lastSync: nowDate() })
        .onConflictDoUpdate({ target: syncStatus.tableName, set: { lastSync: nowDate() } });

      return true;
    } catch (error) {
      Logger.error("Sync products failed:", error);
      return false;
    }
  },

  async syncCategories() {
    const { isLoggedIn, user } = useAuthStore.getState();
    if (!(isLoggedIn && user?.accessToken)) return false;

    try {
      const response = await api.get("/product-category");
      const backendCategories = response.data;

      await db.transaction(async (tx) => {
        for (const c of backendCategories) {
          await upsertSingleCategory(tx, c);
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
    if (!(isLoggedIn && user?.accessToken)) return false;

    try {
      const response = await api.get("/transaction?size=100&sort=createdAt,desc");
      const backendTransactions = response.data.content;

      await db.transaction(async (tx) => {
        for (const t of backendTransactions) {
          await upsertSingleTransaction(tx, t);
        }
      });
      await db
        .insert(syncStatus)
        .values({ tableName: "transactions", lastSync: nowDate() })
        .onConflictDoUpdate({ target: syncStatus.tableName, set: { lastSync: nowDate() } });

      return true;
    } catch (error) {
      Logger.error("Sync transactions failed:", error);
      return false;
    }
  },

  async pushTransactions() {
    const { isLoggedIn, user } = useAuthStore.getState();
    if (!(isLoggedIn && user?.accessToken)) return false;

    try {
      const unsynced = await db.select().from(transactions).where(eq(transactions.isSynced, false));

      for (const txn of unsynced) {
        const items = await db
          .select()
          .from(transactionItems)
          .where(eq(transactionItems.transactionId, txn.id));

        const payload = {
          storeId: txn.storeId,
          customerId: txn.customerId || undefined,
          totalPrice: txn.totalPrice,
          totalTax: txn.totalTax,
          totalDiscount: txn.totalDiscount,
          totalCommission: txn.totalCommission,
          paymentMethodCode: txn.paymentMethodCode,
          transactionTypeCode: txn.transactionTypeCode,
          statusCode: txn.statusCode,
          in: txn.isIn,
          description: txn.description,
          transactionProducts: items.map(mapTransactionProduct),
          createdAt: txn.createdAt ? txn.createdAt.toISOString() : undefined,
        };

        const response = await api.post("/transaction", payload);
        const backendTxn = response.data as TransactionResponse;

        await db.transaction(async (tx) => {
          await handlePostPushSync(tx, txn.id, backendTxn);
        });
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
  },
};
