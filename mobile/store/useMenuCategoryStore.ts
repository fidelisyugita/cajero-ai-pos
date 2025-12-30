import { create } from "zustand";

interface CategoryState {
	selectedCategory: string;
	searchQuery: string;
	setSelectedCategory: (category: string) => void;
	setSearchQuery: (query: string) => void;
	clearSelectedCategory: () => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
	selectedCategory: "ALL",
	searchQuery: "",
	setSelectedCategory: (category) => set({ selectedCategory: category, searchQuery: "" }), // Clear search when category changes
	setSearchQuery: (query) => set({ searchQuery: query }),
	clearSelectedCategory: () => set({ selectedCategory: "ALL", searchQuery: "" }),
}));
