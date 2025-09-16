import { useMutation } from "@tanstack/react-query";
import type { LoginFormData } from "@/schemas/auth";
import type { AuthResponse } from "@/types/auth";
import { authService } from "@/services/auth.service";
import { useAuth } from "./AuthContext";

// export function useLoginMutation() {
//   return useMutation<AuthResponse, Error, LoginFormData>({
//     mutationFn: (values) =>
//       apiClient<AuthResponse>("/auth/signin", {
//         method: "POST",
//         data: values,
//       }),
//   });
// }

export const useLoginMutation = () => {
  const { login } = useAuth();

  return useMutation<AuthResponse, Error, LoginFormData>({
    mutationFn: (values) => authService.signin(values),
    onSuccess: (data) => {
      login(data);
    },
    onError: (error) => {
      throw error;
    },
  });
};
