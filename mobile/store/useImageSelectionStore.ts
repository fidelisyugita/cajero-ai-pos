import { create } from "zustand";

interface ImageSelectionStore {
	imageUri: string;
	setImageUri: (imageUri: string) => void;
	onImageUploaded?: (imageUri: string) => void;
	setOnImageUploaded: (callback?: (imageUri: string) => void) => void;
	reset: () => void;
}

const useImageSelectionStore = create<ImageSelectionStore>((set) => ({
	imageUri: "",
	setImageUri: (imageUri) => set({ imageUri }),
	onImageUploaded: undefined,
	setOnImageUploaded: (callback) => set({ onImageUploaded: callback }),
	reset: () =>
		set({
			imageUri: "",
			onImageUploaded: undefined,
		}),
}));

export default useImageSelectionStore;
