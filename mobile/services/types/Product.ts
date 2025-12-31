import type { PageResponse } from "./Page";

export interface GetProductsParams {
	page: number;
	size: number;
	sortBy: string;
	sortDir: string;
	keyword?: string;
	categoryCode?: string;
	startDate?: string;
	endDate?: string;
	includeDeleted?: boolean;
}

export type ProductPageResponse = PageResponse<Product>;

// ProductResponse.java matches
export interface Product {
	id: string;
	storeId: string;
	name: string;
	imageUrl: string;
	description: string;
	stock: number;
	rejectCount: number;
	soldCount: number;
	categoryCode: string;
	categoryName?: string; // Added for display

	barcode: string;
	buyingPrice: number;
	sellingPrice: number;
	commission: number;
	discount: number;
	tax: number;
	ingredients: ProductIngredient[];
	createdBy: string;
	updatedBy: string;
	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
}

export interface ProductIngredient {
	ingredientId: string;
	name: string;
	description: string;
	stock: number;
	measureUnitCode: string; // from Ingredient
	measureUnitName: string; // from Ingredient
	quantityNeeded: number;
}

export interface CreateProductRequest {
	name: string;
	description?: string;
	stock: number;
	buyingPrice: number;
	sellingPrice: number;
	categoryCode: string;
	imageUrl?: string;
	barcode?: string;
	tax?: number;
	commission?: number;
	discount?: number;
	ingredients?: {
		ingredientId: string;
		quantityNeeded: number;
	}[];
}
