import api from "@/lib/axios";
import type {
  AuthUser,
  SignInOwnerRequest,
  SignInResponse,
  SignStaffInRequest,
} from "@/services/types/Auth";

export const postSignInOwner = async (data: SignInOwnerRequest): Promise<SignInResponse> => {
  const response = await api.post<SignInResponse>("/auth/signin", data);
  return response.data;
};

export const postSignInStaff = async (data: SignStaffInRequest): Promise<SignInResponse> => {
  const response = await api.post<SignInResponse>("/auth/signin", data);
  return response.data;
};

export type { AuthUser, SignInOwnerRequest, SignInResponse, SignStaffInRequest };
