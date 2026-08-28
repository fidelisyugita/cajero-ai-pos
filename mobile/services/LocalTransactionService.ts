import { and, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { products, transactionItems, transactions } from "@/db/schema";
import { useAuthStore } from "@/store/useAuthStore";
import { nowDate, toDayjs } from "@/utils/Date";
import { generateUUID } from "@/utils/Uuid";
import type { TransactionRequest } from "./types/Transaction";

export const LocalTransactionService = {
  async createTransaction(request: TransactionRequest) {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error("User not logged in");

    const transactionId = generateUUID();
    const now = nowDate();

    await db.transaction(async (tx) => {
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

      // Insert Items
      for (const item of request.transactionProducts) {
        // Fetch product name from DB to store in snapshot
        const productRes = await tx
          .select({ name: products.name })
          .from(products)
          .where(eq(products.id, item.productId));
        const productName = productRes[0]?.name || "Unknown Product";

        await tx.insert(transactionItems).values({
          id: generateUUID(),
          transactionId: transactionId,
          productId: item.productId,
          quantity: item.quantity,
          sellingPrice: item.sellingPrice,
          buyingPrice: item.buyingPrice,
          tax: item.tax,
          commission: item.commission,
          discount: item.discount,
          note: item.note,
          selectedVariants: item.selectedVariants,
          productName: productName,
        });

        // Update Stock (Optimistic)
        // We decrement stock in `products` table
        await tx.run(
          sql`UPDATE ${products} SET stock = stock - ${item.quantity} WHERE id = ${item.productId}`,
        );
      }
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
  async getTransactions(params: any = {}) {
    const { page = 0, size = 20, startDate, endDate } = params;

    // Build conditions
    const conditions: any[] = [];

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
      conditions.push(
        or(like(transactions.id, searchPattern), like(transactions.description, searchPattern)),
      );
    }

    // Combine conditions
    const finalCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select()
      .from(transactions)
      .where(finalCondition)
      .limit(size)
      .offset(page * size)
      .orderBy(sql`${transactions.createdAt} DESC`); // Default sort desc

    // Map to TransactionResponse (simplified for list)
    return Promise.all(
      result.map(async (txn) => {
        const items = await db
          .select()
          .from(transactionItems)
          .where(eq(transactionItems.transactionId, txn.id));
        return {
          ...txn,
          transactionProduct: items, // Map to expected structure if needed, but length usage is key
          id: txn.id,
          createdAt: txn.createdAt ? toDayjs(txn.createdAt).toISOString() : "",
          updatedAt: "", // Not tracked in local list query mostly
        };
      }),
    );
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
