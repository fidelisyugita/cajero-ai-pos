import { apiClient } from "@/lib/apiClient";
import type { PaginatedResponse, PettyCash } from "@/types/api";

export type PettyCashError = Error;

export const pettyCashService = {
  getPettyCashs: async (
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<PettyCash>> => {
    return apiClient(`/petty-cash?page=${page}&size=${size}`);
  },

  getPettyCash: async (id: string): Promise<PettyCash> => {
    return apiClient(`/petty-cash/${id}`);
  },

  addPettyCash: async (
    pettyCash: Omit<PettyCash, "id" | "storeId" | "createdAt" | "updatedAt">
  ): Promise<PettyCash> => {
    return apiClient("/petty-cash", {
      method: "POST",
      data: pettyCash,
    });
  },

  updatePettyCash: async (
    id: string,
    pettyCash: Partial<PettyCash>
  ): Promise<PettyCash> => {
    return apiClient(`/petty-cash/${id}`, {
      method: "PUT",
      data: pettyCash,
    });
  },
};
