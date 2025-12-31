import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Variant } from "@/services/types/Variant";

const deleteVariant = async (id: string): Promise<Variant> => {
    const response = await api.delete<Variant>(`/variant/${id}`);
    return response.data;
};

export const useDeleteVariantMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteVariant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["variants"] });
        },
    });
};
