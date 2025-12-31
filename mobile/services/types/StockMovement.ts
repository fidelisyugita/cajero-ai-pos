export interface StockMovement {
	id: string;
	createdAt: string;
	updatedAt: string;
	storeId: string;
	ingredientId: string;
	variantId: string | null;
	productId: string | null;
	transactionId: string | null;
	type: string;
	quantity: number;
	createdBy: string | null;
	updatedBy: string | null;
	createdByName?: string;
	transactionDescription?: string;
	customerName?: string;
}
