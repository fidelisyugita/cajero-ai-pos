import { create } from "zustand";

type SignInTabState = {
	activeTab: number;
	setActiveTab: (tab: number) => void;
};

export const useSignInTabStore = create<SignInTabState>((set) => ({
	activeTab: 0,
	setActiveTab: (tab) => set({ activeTab: tab }),
}));
