import api from "@/lib/axios";
import { CreateUserRequest, User } from "../types/User";

export const putUser = async (id: string, data: Partial<CreateUserRequest>): Promise<User> => {
  const response = await api.put<User>(`/user/${id}`, data);
  return response.data;
};
