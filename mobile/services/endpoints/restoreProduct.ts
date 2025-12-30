import api from "@/lib/axios";

export const restoreProduct = async (id: string): Promise<boolean> => {
  await api.get(`/product/${id}/restore`);
  return true;
};
