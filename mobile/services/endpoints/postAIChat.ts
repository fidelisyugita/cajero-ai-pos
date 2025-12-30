import api from "@/lib/axios";

export const postAIChat = async (
  prompt: string,
): Promise<{ text: string }> => {
  const response = await api.post<{ text: string }>("/ai/chat", { prompt });
  return response.data;
};
