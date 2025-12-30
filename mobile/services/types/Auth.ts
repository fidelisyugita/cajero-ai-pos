export interface SignInOwnerRequest {
	email: string;
	password: string;
}

export interface SignStaffInRequest {
	email: string;
	password: string;
}

export interface SignInResponse {
	id: string;
	name: string;
	email: string;
	phone: string | null;
	storeId: string;
	roleCode: string;
	imageUrl: string | null;
	accessToken: string;
	refreshToken: string;
	createdAt: string | null;
	updatedAt: string | null;
}
