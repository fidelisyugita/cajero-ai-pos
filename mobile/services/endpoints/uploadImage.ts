import api from "@/lib/axios";

export interface UploadImageResponse {
  imageUrl: string;
}

const FILE_EXTENSION_REGEX = /\.(\w+)$/;

export const uploadImage = async (
  fileUri: string,
  type: "product" | "petty-cash" | "store" | "user",
  id?: string, // store id | user id | its current id without extension
): Promise<string> => {
  const formData = new FormData();
  const filename = fileUri.split("/").pop();
  const match = FILE_EXTENSION_REGEX.exec(filename || "");
  const mimeType = match ? `image/${match[1]}` : "image/jpeg";

  formData.append("file", {
    uri: fileUri,
    name: filename || "image.jpg",
    type: mimeType,
  } as unknown as Blob);

  if (id) {
    formData.append("id", id);
  }

  const { data } = await api.post<string>(`/image/${type}-upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
