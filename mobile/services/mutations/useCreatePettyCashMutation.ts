import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPettyCash, CreatePettyCashRequest } from "../endpoints/createPettyCash";

export const useCreatePettyCashMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePettyCashRequest) => createPettyCash(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["petty-cash"] });
        },
    });
};
