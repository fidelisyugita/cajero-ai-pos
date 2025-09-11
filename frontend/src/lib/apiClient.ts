import axios, { AxiosError, type AxiosRequestConfig } from "axios";

interface ApiErrorResponse {
  message: string;
  status: number;
}

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: "/api", // All our API endpoints start with /api
});

// Add a request interceptor to add the auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - could redirect to login or refresh token
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(
      error.response?.data?.message || "An unexpected error occurred"
    );
  }
);

export async function apiClient<T>(
  endpoint: string,
  options: Omit<AxiosRequestConfig, "url"> = {}
): Promise<T> {
  try {
    // If the request body is FormData, don't set Content-Type header
    if (
      !(options.data instanceof FormData) &&
      !options.headers?.["Content-Type"]
    ) {
      options.headers = {
        ...options.headers,
        "Content-Type": "application/json",
      };
    }

    const response = await axiosInstance({
      url: endpoint,
      ...options,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      throw new Error(apiError.response?.data?.message || apiError.message);
    }
    throw error;
  }
}
