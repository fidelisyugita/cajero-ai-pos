import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const api = axios.create({
	baseURL: process.env.EXPO_PUBLIC_API_URL,
});

api.interceptors.request.use(
	(config) => {
		// Get the latest accessToken from Zustand
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

					useAuthStore.getState().setUser({
						...useAuthStore.getState().user!,
						accessToken,
						refreshToken: newRefreshToken,
					});

					originalRequest.headers.set("Authorization", `Bearer ${accessToken}`);
					return api(originalRequest);
				} catch (refreshError) {
					console.error("Token refresh failed:", refreshError);
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
