import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type React from "react";
import { getProductCategory } from "../../endpoints/getProductCategory";
import { useProductCategoriesQuery } from "../useProductCategoriesQuery";

jest.mock("../../endpoints/getProductCategory", () => ({
  getProductCategory: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useProductCategoriesQuery", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("fetches product categories with queryKey ['product-categories']", async () => {
    const mockCategories = [
      {
        code: "COFFEE",
        name: "Coffee",
        storeId: "store-1",
        description: "Brewed coffee",
        createdBy: "user-1",
        updatedBy: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
        deletedAt: null,
      },
      {
        code: "SNACK",
        name: "Snacks",
        storeId: "store-1",
        description: "Light bites",
        createdBy: "user-1",
        updatedBy: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
        deletedAt: null,
      },
    ];

    (getProductCategory as jest.Mock).mockResolvedValue(mockCategories);

    const { result } = await renderHook(() => useProductCategoriesQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getProductCategory).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockCategories);
  });

  it("handles error when getProductCategory fails", async () => {
    const mockError = new Error("Failed to load product categories");
    (getProductCategory as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useProductCategoriesQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(mockError);
  });
});
