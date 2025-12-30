import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Store } from "@/services/types/Store";
import { STORE_QUERY_KEY } from "@/services/queries/useStoreQuery";
import api from "@/lib/axios";

const updateStore = async (storeId: string, data: Partial<Store>) => {
  // api instance handles token automatically
  const response = await api.put(`/store`, { ...data, id: storeId });
  return response.data;
};

export const useUpdateStoreMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Store> }) =>
      updateStore(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...STORE_QUERY_KEY, variables.id] });
    },
  });
};
