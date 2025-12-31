export interface VariantOptionIngredient {
	ingredientId: string;
	name: string;
	quantityNeeded: number;
	measureUnit: string;
}

export interface VariantOption {
	id: string;
	name: string;
	priceAdjusment: number;
	stock: number;
	variantId: string;
	ingredients: VariantOptionIngredient[];
}

export interface Variant {
	id: string;
	storeId: string;
	productId: string;
	name: string;
	description: string;
	isRequired: boolean;
	isMultiple: boolean;
	options: VariantOption[];
	createdBy: string;
	updatedBy: string;
	createdAt: string;
	updatedAt: string;
}

