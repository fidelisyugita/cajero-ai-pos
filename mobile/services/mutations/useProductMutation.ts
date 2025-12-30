import { useMutation } from "@tanstack/react-query";
import { postProduct } from "../endpoints/postProduct";
import type {
	CreateProductRequest,
	Product,
} from "../types/Product";

export function useAddProductMutation() {
	return useMutation<Product, Error, CreateProductRequest>({
		mutationFn: (data: CreateProductRequest) => postProduct(data),
		mutationKey: ["add-product"],
	});
}
