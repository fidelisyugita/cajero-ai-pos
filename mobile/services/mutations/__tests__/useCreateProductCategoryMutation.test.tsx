import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { postProductCategory } from "../../endpoints/postProductCategory";
import type { CreateProductCategoryRequest } from "../../types/ProductCategory";
import { useCreateProductCategoryMutation } from "../useCreateProductCategoryMutation";

jest.mock("../../endpoints/postProductCategory", () => ({
  postProductCategory: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useCreateProductCategoryMutation", () => {
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

  it("successfully creates product category and invalidates product-categories query", async () => {
    const payload: CreateProductCategoryRequest = {
      name: "Pastries & Bakery",
      code: "PASTRIES",
    };
    const mockResponse = { id: "cat-1", code: "PASTRIES", name: "Pastries & Bakery" };
    (postProductCategory as jest.Mock).mockResolvedValue(mockResponse);
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useCreateProductCategoryMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync(payload);
    });

    expect(postProductCategory).toHaveBeenCalledWith(payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["product-categories"] });
    expect(mutationResult).toEqual(mockResponse);
  });

  it("propagates error when postProductCategory fails", async () => {
    const mockError = new Error("Category name already exists");
    (postProductCategory as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useCreateProductCategoryMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          name: "Duplicate Category",
          code: "DUP",
        }),
      ).rejects.toEqual(mockError);
    });
  });
});
