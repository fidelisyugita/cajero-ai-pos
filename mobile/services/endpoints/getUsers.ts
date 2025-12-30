import api from "@/lib/axios";
import { User } from "../types/User";

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>("/user");
  return response.data;
};
