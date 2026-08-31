import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import Logger from "@/services/logger";
import { useAuthStore } from "@/store/useAuthStore";

interface FailedQueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processFailedQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().user?.accessToken;
    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
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
    useAuthStore.getState().setUser(undefined);
    useAuthStore.getState().setLoggedIn(false);
    return null;
  }
}

const queueFailedRequest = (originalRequest: InternalAxiosRequestConfig) => {
  return new Promise<string>((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  }).then((token) => {
    originalRequest.headers.set("Authorization", `Bearer ${token}`);
    return api(originalRequest);
  });
};

const handleUnauthorized = async (
  originalRequest: InternalAxiosRequestConfig & { _retry?: boolean },
  error: AxiosError,
) => {
  if (isRefreshing) {
    return queueFailedRequest(originalRequest);
  }

  originalRequest._retry = true;
  isRefreshing = true;

  const refreshToken = useAuthStore.getState().user?.refreshToken;
  if (!refreshToken) {
    useAuthStore.getState().setUser(undefined);
    useAuthStore.getState().setLoggedIn(false);
    isRefreshing = false;
    return Promise.reject(error);
  }

  try {
    const newAccessToken = await refreshAuthTokens(refreshToken);
    if (newAccessToken) {
      processFailedQueue(null, newAccessToken);
      originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
      return api(originalRequest);
    }
    processFailedQueue(error, null);
    return Promise.reject(error);
  } catch (refreshError) {
    processFailedQueue(refreshError, null);
    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      return handleUnauthorized(originalRequest, error);
    }

    return Promise.reject(error);
  },
);

export default api;
