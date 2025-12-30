import type { PageResponse } from "./Page";

export interface TransactionStatusRef {
	code: string;
	name: string;
	description?: string;
}

export interface TransactionTypeRef {
	code: string;
	name: string;
	description?: string;
}

export interface PaymentMethodRef {
	code: string;
	name: string;
	description?: string;
}

export interface TransactionProductRequest {
	productId: string;
	selectedVariants: any; // JsonNode in backend
	note?: string;
	quantity: number;
	buyingPrice: number;
	sellingPrice: number;
	commission: number;
	discount: number;
	tax: number;
}

export interface TransactionRequest {
	totalTax: number;
	totalCommission: number;
	totalDiscount: number;
	totalPrice: number;
	description?: string;
	statusCode: string;
	transactionTypeCode: string;
	paymentMethodCode: string;
	transactionProducts: TransactionProductRequest[];
	isIn: boolean;
	customerId?: string; // UUID
}

export interface TransactionProductResponse {
	productId: string;
	categoryCode: string;
	measureUnitCode: string;
	name: string;
	description: string;
	stock: number;
	rejectCount: number;
	soldCount: number;
	imageUrl: string;
	selectedVariants: any; // JsonNode
	note: string;
	quantity: number;
	buyingPrice: number;
	sellingPrice: number;
	commission: number;
	discount: number;
	tax: number;
}

export interface TransactionResponse {
	id: string; // UUID
	storeId: string;
	transactionNumber: string;
	totalCommission: number;
	totalDiscount: number;
	totalTax: number;
	totalPrice: number;
	description: string;
	statusCode: string;
	transactionTypeCode: string;
	paymentMethodCode: string;
	transactionProduct: TransactionProductResponse[];
	in: boolean; // mapped from 'isIn'
	customerId: string;
	createdBy: string;
	updatedBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface GetTransactionsParams {
	page?: number;
	size?: number;
	sortBy?: string;
	sortDir?: string;
	statusCode?: string;
	transactionTypeCode?: string;
	paymentMethodCode?: string;
	startDate?: string;
	endDate?: string;
	productId?: string;
	search?: string;
}

export type TransactionPageResponse = PageResponse<TransactionResponse>;
