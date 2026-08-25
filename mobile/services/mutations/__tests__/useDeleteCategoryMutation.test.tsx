import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { deleteCategory } from "../../endpoints/deleteCategory";
import { useDeleteCategoryMutation } from "../useDeleteCategoryMutation";

jest.mock("../../endpoints/deleteCategory", () => ({
  deleteCategory: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useDeleteCategoryMutation", () => {
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

  it("successfully deletes category and invalidates product-categories query", async () => {
    (deleteCategory as jest.Mock).mockResolvedValue({ success: true });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useDeleteCategoryMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync("CAT-SNACKS");
    });

    expect(deleteCategory).toHaveBeenCalledWith("CAT-SNACKS");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["product-categories"] });
    expect(mutationResult).toEqual({ success: true });
  });

  it("propagates error when deleteCategory fails", async () => {
    const mockError = new Error("Category has linked products");
    (deleteCategory as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useDeleteCategoryMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(result.current.mutateAsync("CAT-LOCKED")).rejects.toEqual(mockError);
    });
  });
});
