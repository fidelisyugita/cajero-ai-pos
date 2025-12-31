import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Variant } from "@/services/types/Variant";

interface UpdateVariantData {
    name: string;
    description?: string;
    isRequired: boolean;
    isMultiple: boolean;
    options: {
        id?: string; // Optional for new options
        name: string;
        priceAdjusment: number;
        stock: number;
        ingredients?: {
            ingredientId: string;
            quantityNeeded: number;
        }[];
    }[];
}

interface UpdateVariantParams {
    id: string;
    data: UpdateVariantData;
}

const updateVariant = async ({ id, data }: UpdateVariantParams): Promise<Variant> => {
    const response = await api.put<Variant>(`/variant/${id}`, data);
    return response.data;
};

export const useUpdateVariantMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateVariant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["variants"] });
        },
    });
};
