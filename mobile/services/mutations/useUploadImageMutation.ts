import { useMutation } from "@tanstack/react-query";
import { uploadImage } from "../endpoints/uploadImage";

export const useUploadImageMutation = () => {
	return useMutation({
		mutationFn: ({ fileUri, type, id }: { fileUri: string; type: "product" | "petty-cash" | "store" | "user"; id?: string }) =>
			uploadImage(fileUri, type, id),
	});
};
