import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postUser } from "../endpoints/postUser";
import { USERS_QUERY_KEY } from "../queries/useUsersQuery";
import type { CreateUserRequest } from "../types/User";

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => postUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};
