import { create } from "zustand";

interface MeasureUnit {
	name: string;
	code: string;
}

type MeasureUnitCallback = (measureUnit: MeasureUnit | null) => void;

interface MeasureUnitStore {
	// State
	selectedMeasureUnit: MeasureUnit | null;
	saveCallback: MeasureUnitCallback | null;
	newMeasureUnitName: string;
	newMeasureUnitCode: string;

	// Actions
	selectMeasureUnit: (measureUnit: MeasureUnit | null) => void;
	setSaveCallback: (callback: MeasureUnitCallback | null) => void;
	saveMeasureUnit: () => void;
	setNewMeasureUnitName: (name: string) => void;
	setNewMeasureUnitCode: (code: string) => void;
	reset: () => void;
}

export const useMeasureUnitStore = create<MeasureUnitStore>((set, get) => ({
	// Initial state
	selectedMeasureUnit: null,
	saveCallback: null,
	newMeasureUnitName: "",
	newMeasureUnitCode: "",

	// Actions
	selectMeasureUnit: (measureUnit) =>
		set({ selectedMeasureUnit: measureUnit }),

	setSaveCallback: (callback) => set({ saveCallback: callback }),

	saveMeasureUnit: () => {
		const { selectedMeasureUnit, saveCallback } = get();
		if (saveCallback) {
			saveCallback(selectedMeasureUnit);
		}
	},

	setNewMeasureUnitName: (name: string) =>
		set({ newMeasureUnitName: name }),

	setNewMeasureUnitCode: (code: string) =>
		set({ newMeasureUnitCode: code }),

	reset: () =>
		set({
			selectedMeasureUnit: null,
			saveCallback: null,
			newMeasureUnitName: "",
			newMeasureUnitCode: "",
		}),
}));
