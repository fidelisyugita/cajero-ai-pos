import { create } from "zustand";

interface Category {
	name: string;
	code: string;
}

type CategoryCallback = (category: Category | null) => void;

interface CategoryStore {
	// State
	selectedCategory: Category | null;
	saveCallback: CategoryCallback | null;
	newCategoryName: string;

	// Actions
	selectCategory: (category: Category | null) => void;
	setSaveCallback: (callback: CategoryCallback | null) => void;
	saveCategory: () => void;
	setNewCategoryName: (name: string) => void;
	reset: () => void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
	// Initial state
	selectedCategory: null,
	saveCallback: null,
	newCategoryName: "",

	// Actions
	selectCategory: (category) => set({ selectedCategory: category }),

	setSaveCallback: (callback) => set({ saveCallback: callback }),

	saveCategory: () => {
		const { selectedCategory, saveCallback } = get();
		if (saveCallback) {
			saveCallback(selectedCategory);
		}
	},

	setNewCategoryName: (name: string) => set({ newCategoryName: name }),

	reset: () =>
		set({
			selectedCategory: null,
			saveCallback: null,
			newCategoryName: "",
		}),
}));
