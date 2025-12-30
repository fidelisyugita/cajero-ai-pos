import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Existing tables
export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	name: text("name"),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	phone: text("phone"),
	storeId: text("store_id"),
	roleCode: text("role_code").notNull(),
	imageUrl: text("image_url"),
	accessToken: text("access_token"),
	createdAt: integer("created_at", { mode: "timestamp_ms" }),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull(),
	accessToken: text("accessToken").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
	createdAt: integer("created_at", { mode: "timestamp_ms" }),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
});

// New tables for Offline First
export const categories = sqliteTable("categories", {
	id: text("id").primaryKey(), // UUID or code
	name: text("name").notNull(),
	description: text("description"),
	createdAt: integer("created_at", { mode: "timestamp_ms" }),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
	deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
});

export const products = sqliteTable("products", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	sellingPrice: integer("selling_price"),
	buyingPrice: integer("buying_price"),
	stock: integer("stock"),
	categoryId: text("category_id"),
	imageUrl: text("image_url"),
	barcode: text("barcode"),
	tax: integer("tax"),
	commission: integer("commission"),
	discount: integer("discount"),
	measureUnitCode: text("measure_unit_code"),
	measureUnitName: text("measure_unit_name"),
	createdAt: integer("created_at", { mode: "timestamp_ms" }),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
	deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
});

export const transactions = sqliteTable("transactions", {
	id: text("id").primaryKey(),
	storeId: text("store_id"),
	customerId: text("customer_id"),
	totalPrice: integer("total_price"),
	totalTax: integer("total_tax"),
	totalDiscount: integer("total_discount"),
	totalCommission: integer("total_commission"),
	description: text("description"),
	paymentMethodCode: text("payment_method_code"),
	transactionTypeCode: text("transaction_type_code"),
	statusCode: text("status_code"),
	isIn: integer("is_in", { mode: "boolean" }),
	isSynced: integer("is_synced", { mode: "boolean" }).default(false),
	createdAt: integer("created_at", { mode: "timestamp_ms" }),
});

export const transactionItems = sqliteTable("transaction_items", {
	id: text("id").primaryKey(),
	transactionId: text("transaction_id").notNull(),
	productId: text("product_id").notNull(),
	quantity: integer("quantity").notNull(),
	sellingPrice: integer("selling_price").notNull(), // selling price
	buyingPrice: integer("buying_price"),
	tax: integer("tax"),
	commission: integer("commission"),
	discount: integer("discount"),
	note: text("note"),
	selectedVariants: text("selected_variants", { mode: "json" }), // Store as JSON
	productName: text("product_name"), // Snapshot
});

export const productIngredients = sqliteTable("product_ingredients", {
	productId: text("product_id").notNull(),
	ingredientId: text("ingredient_id").notNull(),
	name: text("name"),
	stock: integer("stock"),
	measureUnitCode: text("measure_unit_code"),
	measureUnitName: text("measure_unit_name"),
	quantityNeeded: integer("quantity_needed"),
});

export const syncStatus = sqliteTable("sync_status", {
	tableName: text("table_name").primaryKey(),
	lastSync: integer("last_sync", { mode: "timestamp_ms" }),
});
