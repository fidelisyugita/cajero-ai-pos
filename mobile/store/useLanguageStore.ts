import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import zustandStorage from "@/lib/Storage";

type Language = "en" | "id";

interface LanguageState {
	language: Language;
	setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
	persist(
		(set) => ({
			language: "en",
			setLanguage: (language) => set({ language }),
		}),
		{
			name: "language-storage",
			storage: createJSONStorage(() => zustandStorage),
		},
	),
);
