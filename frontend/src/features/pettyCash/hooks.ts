import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  pettyCashService,
  type PettyCashError,
} from "@/services/pettyCash.service";
import { queryKeys } from "@/lib/query-keys";
import type { PettyCash } from "@/types/api";

export const usePettyCashs = (page = 0, size = 10) => {
  return useQuery({
    queryKey: queryKeys.pettyCash.list(page),
    queryFn: () => pettyCashService.getPettyCashs(page, size),
  });
};

export const useCreatePettyCash = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PettyCash,
    PettyCashError,
    Omit<PettyCash, "id" | "storeId" | "createdAt" | "updatedAt">
  >({
    mutationFn: (data) => pettyCashService.addPettyCash(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pettyCash.all,
      });
    },
  });
};

export const useUpdatePettyCash = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PettyCash,
    PettyCashError,
    { id: string; data: Partial<PettyCash> }
  >({
    mutationFn: ({ id, data }) => pettyCashService.updatePettyCash(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pettyCash.all,
      });
    },
  });
};
