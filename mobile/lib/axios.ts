import axios from "axios";
import Logger from "@/services/logger";
import { useAuthStore } from "@/store/useAuthStore";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().user?.accessToken;
    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

async function refreshAuthTokens(refreshToken: string): Promise<string | null> {
  try {
    const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/refreshtoken`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      useAuthStore.getState().setUser({
        ...currentUser,
        accessToken,
        refreshToken: newRefreshToken,
      });
    }

    return accessToken;
  } catch (refreshError) {
    Logger.error("Token refresh failed:", refreshError);
    useAuthStore.getState().setLoggedIn(false);
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().user?.refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().setLoggedIn(false);
        return Promise.reject(error);
      }

      const newAccessToken = await refreshAuthTokens(refreshToken);
      if (newAccessToken) {
        originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  },
);
export default api;
