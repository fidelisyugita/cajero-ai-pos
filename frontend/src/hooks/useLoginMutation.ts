import { useMutation } from "@tanstack/react-query";
import type { LoginFormData } from "@/schemas/auth";
import type { AuthResponse } from "@/types/auth";
import { apiClient } from "@/lib/apiClient";

export function useLoginMutation() {
  return useMutation<AuthResponse, Error, LoginFormData>({
    mutationFn: (values) =>
      apiClient<AuthResponse>("/auth/signin", {
        method: "POST",
        data: values,
      }),
  });
}
