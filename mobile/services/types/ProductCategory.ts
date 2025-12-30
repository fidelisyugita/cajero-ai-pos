export interface ProductCategory {
	code: string;
	storeId: string;
	name: string;
	description: string;
	createdBy: string | null;
	updatedBy: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface CreateProductCategoryRequest {
	name: string;
	code: string;
	description?: string;
}

