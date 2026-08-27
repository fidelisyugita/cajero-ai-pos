import { useMutation, useQueryClient } from "@tanstack/react-query";
import { putUser } from "../endpoints/putUser";
import type { CreateUserRequest } from "../types/User";

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateUserRequest> }) =>
      putUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["auth-user"] }); // If we cache the auth user
    },
  });
};
