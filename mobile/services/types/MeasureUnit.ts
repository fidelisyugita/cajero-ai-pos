export interface MeasureUnit {
	code: string;
	name: string;
	description: string;
	storeId?: string | null;
}

export interface CreateMeasureUnitRequest {
	code: string;
	name: string;
	description: string;
}
