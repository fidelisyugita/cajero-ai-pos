import api from "@/lib/axios";

export const deleteProduct = async (id: string): Promise<boolean> => {
  await api.delete(`/product/${id}`);
  return true;
};
