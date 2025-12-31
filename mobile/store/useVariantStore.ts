import { create } from "zustand";

export interface VariantOption {
	id: string; // Temporary ID (e.g. UUID v4 or random string) for UI keys if new, or real ID if existing
	isNew?: boolean;
	name: string;
	priceAdjusment: number;
	stock: number;
    ingredients?: {
        ingredientId: string;
        name: string;
        quantityNeeded: number;
        measureUnit?: string;
    }[];
}

export interface VariantDraft {
	id: string; // Temporary ID or real ID
	isNew?: boolean;
	name: string;
	options: VariantOption[];
	isRequired: boolean;
	isMultiple: boolean;
}

interface VariantStore {
	// State
	variants: VariantDraft[];
	selectedVariant: VariantDraft | null; // For editing in modal
	deletedVariantIds: string[];

	// Actions
	setVariants: (variants: VariantDraft[]) => void;
	addVariant: (variant: VariantDraft) => void;
	updateVariant: (id: string, variant: VariantDraft) => void;
	removeVariant: (id: string) => void;
	selectVariant: (variant: VariantDraft | null) => void;
	reset: () => void;
}

export const useVariantStore = create<VariantStore>((set) => ({
	variants: [],
	selectedVariant: null,
	deletedVariantIds: [],

	setVariants: (variants) => set({ variants, deletedVariantIds: [] }),

	addVariant: (variant) =>
		set((state) => ({ variants: [...state.variants, variant] })),

	updateVariant: (id, updatedVariant) =>
		set((state) => ({
			variants: state.variants.map((v) => (v.id === id ? updatedVariant : v)),
		})),

	removeVariant: (id) =>
		set((state) => {
			const variantToRemove = state.variants.find((v) => v.id === id);
			const isExisting = variantToRemove && !variantToRemove.isNew;
			
			return {
				variants: state.variants.filter((v) => v.id !== id),
				deletedVariantIds: isExisting 
					? [...state.deletedVariantIds, id] 
					: state.deletedVariantIds,
			};
		}),

	selectVariant: (variant) => set({ selectedVariant: variant }),

	reset: () => set({ variants: [], selectedVariant: null, deletedVariantIds: [] }),
}));
