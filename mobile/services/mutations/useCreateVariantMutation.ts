import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Variant } from "@/services/types/Variant";

interface CreateVariantData {
	productId: string;
	name: string;
	description?: string;
	isRequired: boolean;
	isMultiple: boolean;
	options: {
		name: string;
		priceAdjusment: number;
		stock: number;
        ingredients?: {
            ingredientId: string;
            quantityNeeded: number;
        }[];
	}[];
}

const createVariant = async (data: CreateVariantData): Promise<Variant> => {
	const response = await api.post<Variant>("/variant", data);
	return response.data;
};

export const useCreateVariantMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createVariant,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["variants"] });
		},
	});
};
