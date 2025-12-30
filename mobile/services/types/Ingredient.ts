export interface Ingredient {
	id: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string;
	storeId: string;
	name: string;
	description: string;
	stock: number;
	measureUnitCode: string;
	createdBy: string;
	updatedBy: string;
}

export interface CreateIngredientRequest {
	id?: string;
	name: string;
	description: string;
	stock: number;
	measureUnitCode: string;
}
