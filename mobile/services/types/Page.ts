export interface Sort {
	empty: boolean;
	sorted: boolean;
	unsorted: boolean;
}

export interface Pageable {
	offset: number;
	sort: Sort;
	paged: boolean;
	pageNumber: number;
	pageSize: number;
	unpaged: boolean;
}

export interface PageResponse<T> {
	content: T[];
	pageable: Pageable;
	last: boolean;
	totalPages: number;
	totalElements: number;
	size: number;
	number: number;
	sort: Sort;
	first: boolean;
	numberOfElements: number;
	empty: boolean;
}
