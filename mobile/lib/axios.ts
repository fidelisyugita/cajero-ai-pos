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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().user?.refreshToken;

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/auth/refreshtoken`,
            { refreshToken },
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          const currentUser = useAuthStore.getState().user;
          if (currentUser) {
            useAuthStore.getState().setUser({
              ...currentUser,
              accessToken,
              refreshToken: newRefreshToken,
            });
          }

          originalRequest.headers.set("Authorization", `Bearer ${accessToken}`);
          return api(originalRequest);
        } catch (refreshError) {
          Logger.error("Token refresh failed:", refreshError);
          useAuthStore.getState().setLoggedIn(false);
        }
      } else {
        useAuthStore.getState().setLoggedIn(false);
      }
    }
    return Promise.reject(error);
  },
);
export default api;
