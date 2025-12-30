import { create } from "zustand";

interface Ingredient {
	id: string;
	name: string;
	measureUnitName: string;
	quantityNeeded?: number;
}

type IngredientCallback = (ingredient: Ingredient[] | null) => void;

interface IngredientStore {
	// State
	selectedIngredient: Ingredient[] | null;
	saveCallback: IngredientCallback | null;
	newIngredientName: string;

	// Actions
	selectIngredient: (ingredient: Ingredient | null) => void;
	setSelectedIngredients: (ingredients: Ingredient[]) => void;
	updateQuantity: (id: string, quantity: number) => void;
	setSaveCallback: (callback: IngredientCallback | null) => void;
	saveIngredient: () => void;
	setNewIngredientName: (name: string) => void;
	reset: () => void;
}

export const useIngredientStore = create<IngredientStore>((set, get) => ({
	// Initial state
	selectedIngredient: null,
	saveCallback: null,
	newIngredientName: "",

	// Actions
	selectIngredient: (ingredient) => {
		if (!ingredient) return;
		const selected = get().selectedIngredient ?? [];
		const exists = selected.find((i) => i.id === ingredient.id);
		if (exists) {
			// Uncheck: remove from array
			const updated = selected.filter((i) => i.id !== ingredient.id);
			set({
				selectedIngredient: updated.length > 0 ? updated : null,
			});
		} else {
			// Check: add to array with default quantity
			set({
				selectedIngredient: [...selected, { ...ingredient, quantityNeeded: 1 }],
			});
		}
	},

	setSelectedIngredients: (ingredients) => {
		set({ selectedIngredient: ingredients.length > 0 ? ingredients : null });
	},

	updateQuantity: (id, quantity) => {
		const selected = get().selectedIngredient ?? [];
		const updated = selected.map((i) =>
			i.id === id ? { ...i, quantityNeeded: quantity } : i,
		);
		set({ selectedIngredient: updated });
	},

	setSaveCallback: (callback) => set({ saveCallback: callback }),

	saveIngredient: () => {
		const { selectedIngredient, saveCallback } = get();
		if (saveCallback) {
			saveCallback(selectedIngredient);
		}
	},

	setNewIngredientName: (name: string) => set({ newIngredientName: name }),

	reset: () =>
		set({
			selectedIngredient: null,
			saveCallback: null,
			newIngredientName: "",
		}),
}));
