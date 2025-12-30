import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postMeasureUnit } from "../endpoints/postMeasureUnit";
import { CreateMeasureUnitRequest } from "../types/MeasureUnit";

export const useCreateMeasureUnitMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateMeasureUnitRequest) => postMeasureUnit(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["measure-units"] });
        },
    });
};
