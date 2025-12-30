import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import zustandStorage from "@/lib/Storage";

interface AuthState {
	isLoggedIn: boolean;
	setLoggedIn: (value: boolean) => void;
	user?: {
		id: string;
		name: string;
		email: string;
		phone: string | null;
		storeId: string;
		roleCode: string;
		imageUrl: string | null;
		accessToken: string;
		refreshToken: string;
		createdAt: string | null;
		updatedAt: string | null;
	};
	setUser: (user: AuthState["user"]) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			isLoggedIn: false,
			setLoggedIn: (value) => set({ isLoggedIn: value }),
			user: undefined,
			setUser: (user) => set({ user }),
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => zustandStorage),
		},
	),
);
