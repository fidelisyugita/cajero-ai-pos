import api from "@/lib/axios";
import type { Store } from "@/services/types/Store";

export const getStore = async (id: string) => {
  const response = await api.get<Store>(`/store/${id}`);
  return response.data;
};
