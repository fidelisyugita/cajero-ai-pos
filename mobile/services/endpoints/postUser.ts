import api from "@/lib/axios";
import { CreateUserRequest, User } from "../types/User";

export const postUser = async (data: CreateUserRequest): Promise<User> => {
  const response = await api.post<User>("/user", data);
  return response.data;
};
