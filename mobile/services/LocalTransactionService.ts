import { db } from "@/db/drizzle";
import { transactions, transactionItems, products, productIngredients } from "@/db/schema";
import { TransactionRequest } from "./types/Transaction";
import { useAuthStore } from "@/store/useAuthStore";
import { eq, sql, and, like, or } from "drizzle-orm";
// We need a way to generate UUIDs. 
// Since we are in Expo/RN, we can use crypto.randomUUID if available or a fallback.
const generateUUID = () => {
  // Simple fallback if crypto not available globally in context
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const LocalTransactionService = {
  async createTransaction(request: TransactionRequest) {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error("User not logged in");

    const transactionId = generateUUID();
    const now = new Date();

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
        const productRes = await tx.select({ name: products.name }).from(products).where(eq(products.id, item.productId));
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
          sql`UPDATE ${products} SET stock = stock - ${item.quantity} WHERE id = ${item.productId}`
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
      conditions.push(sql`${transactions.createdAt} >= ${new Date(startDate).getTime()}`);
    }
    if (endDate) {
      // End of day logic might be needed, but assume exact or handled by caller?
      // Usually endDate includes time or is just date. If just date, we want < next day.
      // For simplicity, raw comparison.
      conditions.push(sql`${transactions.createdAt} <= ${new Date(endDate).getTime()}`);
    }

    if (params.search) {
      const searchPattern = `%${params.search}%`;
      conditions.push(or(
        like(transactions.id, searchPattern),
        like(transactions.description, searchPattern)
      ));
    }

    // Combine conditions
    const finalCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db.select()
      .from(transactions)
      .where(finalCondition)
      .limit(size)
      .offset(page * size)
      .orderBy(sql`${transactions.createdAt} DESC`); // Default sort desc

    // Map to TransactionResponse (simplified for list)
    // Note: transactionItems are not fetched here generally for lists unless needed.
    // But the UI shows "Total Order" count. So we might need a join or subquery?
    // Or just lazy load? Or better: check if `transactions` table has simplified counts.
    // It has `totalPrice`, `totalTax` etc.
    // The UI shows `item.transactionProduct?.length`. 
    // We didn't store transactionProduct list in `transactions` table JSON.
    // We stored `transactionItems` separately.
    // We can do a left join or just fetch items count query.
    // For performance in list, getting count is better.

    // Let's keep it simple: Just return transactions for now and maybe fallback count to 0 or fetch separately.
    // Or use `with` / `join`.
    // Drizzle specific:

    return Promise.all(result.map(async (txn) => {
      const items = await db.select().from(transactionItems).where(eq(transactionItems.transactionId, txn.id));
      return {
        ...txn,
        transactionProduct: items, // Map to expected structure if needed, but length usage is key
        id: txn.id,
        createdAt: txn.createdAt ? new Date(txn.createdAt).toISOString() : "",
        updatedAt: "", // Not tracked in local list query mostly
      };
    }));
  },
  async getTransactionById(id: string) {
    const result = await db.select().from(transactions).where(eq(transactions.id, id));
    if (result.length === 0) return null;
    const txn = result[0];

    // Join with products table to ensure we have the name if the snapshot is missing
    const items = await db.select({
      item: transactionItems,
      product: products
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
      createdAt: txn.createdAt ? new Date(txn.createdAt).toISOString() : "",
      // Mapped fields
      in: txn.isIn,
    };
  },
};
