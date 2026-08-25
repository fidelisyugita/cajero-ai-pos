import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { uploadImage } from "../../endpoints/uploadImage";
import { useUploadImageMutation } from "../useUploadImageMutation";

jest.mock("../../endpoints/uploadImage", () => ({
  uploadImage: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useUploadImageMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("successfully uploads image using uploadImage endpoint", async () => {
    const mockResponse = {
      url: "https://storage.googleapis.com/cajero/images/product-1.jpg",
    };
    (uploadImage as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = await renderHook(() => useUploadImageMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync({
        fileUri: "file:///path/to/image.png",
        type: "product",
        id: "prod-1",
      });
    });

    expect(uploadImage).toHaveBeenCalledWith("file:///path/to/image.png", "product", "prod-1");
    expect(mutationResult).toEqual(mockResponse);
  });

  it("propagates error when uploadImage fails", async () => {
    const mockError = new Error("Network upload error");
    (uploadImage as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useUploadImageMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          fileUri: "file:///path/to/image.png",
          type: "store",
        }),
      ).rejects.toEqual(mockError);
    });
  });
});
