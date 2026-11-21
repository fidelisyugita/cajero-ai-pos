import { and, eq, inArray, like, or, type SQL, sql } from "drizzle-orm";
import { type DrizzleTx, db, runInTransaction } from "@/db/drizzle";
import { products, transactionItems, transactions } from "@/db/schema";
import { useAuthStore } from "@/store/useAuthStore";
import { nowDate, toDayjs } from "@/utils/Date";
import { generateUUID } from "@/utils/Uuid";
import type { GetTransactionsParams, TransactionRequest } from "./types/Transaction";

async function fetchProductNameMap(
  tx: DrizzleTx,
  productIds: string[],
): Promise<Map<string, string>> {
  const nameMap = new Map<string, string>();
  if (productIds.length === 0) return nameMap;

  const productRows = await tx
    .select({ id: products.id, name: products.name })
    .from(products)
    .where(inArray(products.id, productIds));
  for (const row of productRows) {
    nameMap.set(row.id, row.name);
  }
  return nameMap;
}

async function insertItemsAndDecrementStock(
  tx: DrizzleTx,
  transactionId: string,
  items: TransactionRequest["transactionProducts"],
): Promise<void> {
  if (items.length === 0) return;

  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const productNameMap = await fetchProductNameMap(tx, productIds);

  await tx.insert(transactionItems).values(
    items.map((item) => ({
      id: generateUUID(),
      transactionId,
      productId: item.productId,
      quantity: item.quantity,
      sellingPrice: item.sellingPrice,
      buyingPrice: item.buyingPrice,
      tax: item.tax,
      commission: item.commission,
      discount: item.discount,
      note: item.note,
      selectedVariants: item.selectedVariants,
      productName: productNameMap.get(item.productId) || "Unknown Product",
    })),
  );

  for (const item of items) {
    tx.run(
      sql`UPDATE ${products} SET stock = stock - ${item.quantity} WHERE id = ${item.productId}`,
    );
  }
}

function groupItemsByTransactionId(items: (typeof transactionItems.$inferSelect)[]) {
  const map = new Map<string, (typeof transactionItems.$inferSelect)[]>();
  for (const item of items) {
    const list = map.get(item.transactionId);
    if (list) {
      list.push(item);
    } else {
      map.set(item.transactionId, [item]);
    }
  }
  return map;
}

export const LocalTransactionService = {
  async createTransaction(request: TransactionRequest) {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error("User not logged in");

    const transactionId = generateUUID();
    const now = nowDate();

    await runInTransaction(async (tx) => {
      // Insert Transaction
      await tx.insert(transactions).values({
        id: transactionId,
        storeId: user.storeId,
        // customerId: request.customerId, // Optional in type?
        customerId: request.customerId || null,
        totalPrice: request.totalPrice,
        totalTax: request.totalTax,
        totalDiscount: request.totalDiscount,
        totalCommission: request.totalCommission,
        paymentMethodCode: request.paymentMethodCode,
        transactionTypeCode: request.transactionTypeCode,
        statusCode: request.statusCode,
        isIn: request.isIn,
        description: request.description,
        isSynced: false,
        createdAt: now,
      });

      await insertItemsAndDecrementStock(tx, transactionId, request.transactionProducts);
    });

    return {
      id: transactionId,
      // ... strict response matching TransactionResponse if needed, or enough for UI to proceed
      // UI usually invalidates query, so minimal return is fine
      storeId: user.storeId,
      totalPrice: request.totalPrice,
      statusCode: request.statusCode,
      createdAt: now.toISOString(),
    };
  },
  async getTransactions(params: GetTransactionsParams = {}) {
    const { page = 0, size = 20, startDate, endDate } = params;

    // Build conditions
    const conditions: SQL[] = [];

    // Date handling
    if (startDate) {
      const startMs = toDayjs(startDate).startOf("day").valueOf();
      conditions.push(sql`${transactions.createdAt} >= ${startMs}`);
    }
    if (endDate) {
      const endMs = toDayjs(endDate).endOf("day").valueOf();
      conditions.push(sql`${transactions.createdAt} <= ${endMs}`);
    }

    if (params.search) {
      const searchPattern = `%${params.search}%`;
      const searchCondition = or(
        like(transactions.id, searchPattern),
        like(transactions.description, searchPattern),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Combine conditions
    const finalCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const txnRows = await db
      .select()
      .from(transactions)
      .where(finalCondition)
      .limit(size)
      .offset(page * size)
      .orderBy(sql`${transactions.createdAt} DESC`);

    if (txnRows.length === 0) return [];

    const txnIds = txnRows.map((t) => t.id);
    const itemsRows = await db
      .select()
      .from(transactionItems)
      .where(inArray(transactionItems.transactionId, txnIds));

    const itemsByTxnId = groupItemsByTransactionId(itemsRows);

    return txnRows.map((txn) => ({
      ...txn,
      transactionProduct: itemsByTxnId.get(txn.id) || [],
      id: txn.id,
      createdAt: txn.createdAt ? toDayjs(txn.createdAt).toISOString() : "",
      updatedAt: "",
    }));
  },
  async getTransactionById(id: string) {
    const result = await db.select().from(transactions).where(eq(transactions.id, id));
    if (result.length === 0) return null;
    const txn = result[0];

    // Join with products table to ensure we have the name if the snapshot is missing
    const items = await db
      .select({
        item: transactionItems,
        product: products,
      })
      .from(transactionItems)
      .leftJoin(products, eq(transactionItems.productId, products.id))
      .where(eq(transactionItems.transactionId, id));

    const mappedItems = items.map(({ item, product }) => ({
      ...item,
      name: product?.name || item.productName || "Unknown Product",
      // Map other fields needed for UI
      sellingPrice: item.sellingPrice,
      // We might need imageUrl, etc from product if available
      imageUrl: product?.imageUrl,
      categoryCode: product?.categoryId,
      description: product?.description,
      buyingPrice: item.buyingPrice,
      tax: item.tax,
      commission: item.commission,
      discount: item.discount,
      note: item.note,
      selectedVariants: item.selectedVariants,
    }));

    return {
      ...txn,
      transactionProduct: mappedItems,
      id: txn.id,
      createdAt: txn.createdAt ? toDayjs(txn.createdAt).toISOString() : "",
      // Mapped fields
      in: txn.isIn,
    };
  },
};
