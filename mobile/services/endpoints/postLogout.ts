import api from "@/lib/axios";
import type { LogoutRequest } from "@/services/types/Auth";

export interface PostLogoutOptions {
  timeout?: number;
}

export const postLogout = async (
  data: LogoutRequest,
  options?: PostLogoutOptions,
): Promise<void> => {
  await api.post("/auth/logout", data, {
    timeout: options?.timeout ?? 3500,
  });
};
