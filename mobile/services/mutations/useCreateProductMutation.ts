import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postProduct } from "../endpoints/postProduct";
import { CreateProductRequest } from "../types/Product";

export const useCreateProductMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateProductRequest) => postProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};
