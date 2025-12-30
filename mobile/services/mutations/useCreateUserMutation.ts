import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postUser } from "../endpoints/postUser";
import { CreateUserRequest } from "../types/User";
import { USERS_QUERY_KEY } from "../queries/useUsersQuery";

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => postUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};
