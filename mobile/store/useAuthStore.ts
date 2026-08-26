import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import zustandStorage from "@/lib/Storage";
import type { AuthUser } from "@/services/types/Auth";

interface AuthState {
  isLoggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
  user?: AuthUser;
  setUser: (user: AuthUser | undefined) => void;
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
