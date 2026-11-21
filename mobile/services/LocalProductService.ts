import { and, eq, isNull, like, type SQL } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { categories, products } from "@/db/schema";
import { nowDate } from "@/utils/Date";

// Select only the product columns consumed by MenuList, StockProducts, and StockVariants
// to minimize Drizzle buildSelectQuery and SQLite row-mapping overhead.
const PRODUCT_SELECT_FIELDS = {
  id: products.id,
  name: products.name,
  sellingPrice: products.sellingPrice,
  stock: products.stock,
  imageUrl: products.imageUrl,
  tax: products.tax,
  commission: products.commission,
  deletedAt: products.deletedAt,
  categoryCode: products.categoryId,
  categoryName: categories.name,
};

const CATEGORY_JOIN_CONDITION = eq(products.categoryId, categories.id);
const NOT_DELETED_CONDITION = isNull(products.deletedAt);

function buildProductConditions(
  search?: string,
  categoryId?: string,
  includeDeleted = false,
): SQL | undefined {
  if (!(search || categoryId || includeDeleted)) {
    return NOT_DELETED_CONDITION;
  }

  const filters: SQL[] = [];
  if (search) filters.push(like(products.name, `%${search}%`));
  if (categoryId) filters.push(eq(products.categoryId, categoryId));
  if (!includeDeleted) filters.push(NOT_DELETED_CONDITION);

  if (filters.length === 0) return undefined;
  return filters.length === 1 ? filters[0] : and(...filters);
}

export const LocalProductService = {
  async getProducts(
    search?: string,
    categoryId?: string,
    page = 0,
    size = 100,
    includeDeleted = false,
  ) {
    const conditions = buildProductConditions(search, categoryId, includeDeleted);

    return await db
      .select(PRODUCT_SELECT_FIELDS)
      .from(products)
      .leftJoin(categories, CATEGORY_JOIN_CONDITION)
      .where(conditions)
      .limit(size)
      .offset(page * size);
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
