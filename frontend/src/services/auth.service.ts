import { apiClient } from "@/lib/apiClient";
import type { LoginFormData } from "@/schemas/auth";
import type { AuthResponse } from "@/types/auth";

export const authService = {
  signin: async (values: LoginFormData): Promise<AuthResponse> => {
    return apiClient(`/auth/signin`, {
      method: "POST",
      data: values,
    });
  },
};
