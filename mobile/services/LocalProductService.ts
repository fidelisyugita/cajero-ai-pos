import { and, eq, isNull, like, type SQL } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { categories, products } from "@/db/schema";
import { nowDate } from "@/utils/Date";

export const LocalProductService = {
  async getProducts(
    search?: string,
    categoryId?: string,
    page = 0,
    size = 100,
    includeDeleted = false,
  ) {
    let conditions: SQL | undefined;

    if (search) conditions = like(products.name, `%${search}%`);
    if (categoryId) {
      const catCondition = eq(products.categoryId, categoryId);
      conditions = conditions ? and(conditions, catCondition) : catCondition;
    }

    if (!includeDeleted) {
      const notDeletedCondition = isNull(products.deletedAt);
      conditions = conditions ? and(conditions, notDeletedCondition) : notDeletedCondition;
    }

    const rows = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(conditions)
      .limit(size)
      .offset(page * size);

    return rows.map((row) => ({
      ...row.products,
      categoryCode: row.products.categoryId,
      categoryName: row.categories?.name,
    }));
  },

  async getProductById(id: string) {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  },

  async getCategories() {
    return await db.select().from(categories);
  },

  async softDeleteProduct(id: string) {
    return await db.update(products).set({ deletedAt: nowDate() }).where(eq(products.id, id));
  },

  async restoreProduct(id: string) {
    return await db.update(products).set({ deletedAt: null }).where(eq(products.id, id));
  },
};
