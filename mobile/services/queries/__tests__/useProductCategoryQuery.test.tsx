import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type React from "react";
import { getProductCategory } from "../../endpoints/getProductCategory";
import { useCategoryQuery, useProductCategoryQuery } from "../useProductCategoryQuery";

jest.mock("../../endpoints/getProductCategory", () => ({
  getProductCategory: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useProductCategoryQuery and useCategoryQuery", () => {
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

  describe("useProductCategoryQuery", () => {
    it("prepends the ALL category option to fetched categories", async () => {
      const mockCategories = [
        {
          code: "BEVERAGE",
          name: "Beverages",
          storeId: "store-1",
          description: "Drinks and beverages",
          createdBy: "user-1",
          updatedBy: null,
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
          deletedAt: null,
        },
      ];

      (getProductCategory as jest.Mock).mockResolvedValue(mockCategories);

      const { result } = await renderHook(() => useProductCategoryQuery(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(getProductCategory).toHaveBeenCalled();
      expect(result.current.data).toEqual([
        {
          code: "ALL",
          name: "All",
          storeId: "",
          description: "",
          createdBy: null,
          updatedBy: null,
          createdAt: "",
          updatedAt: "",
          deletedAt: null,
        },
        ...mockCategories,
      ]);
    });

    it("handles error in useProductCategoryQuery", async () => {
      const mockError = new Error("Failed to get categories");
      (getProductCategory as jest.Mock).mockRejectedValue(mockError);

      const { result } = await renderHook(() => useProductCategoryQuery(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe("useCategoryQuery", () => {
    it("returns raw category list without prepending ALL", async () => {
      const mockCategories = [
        {
          code: "FOOD",
          name: "Food",
          storeId: "store-1",
          description: "Food menu",
          createdBy: "user-1",
          updatedBy: null,
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
          deletedAt: null,
        },
      ];

      (getProductCategory as jest.Mock).mockResolvedValue(mockCategories);

      const { result } = await renderHook(() => useCategoryQuery(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(getProductCategory).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockCategories);
    });

    it("handles error in useCategoryQuery", async () => {
      const mockError = new Error("Failed to get raw categories");
      (getProductCategory as jest.Mock).mockRejectedValue(mockError);

      const { result } = await renderHook(() => useCategoryQuery(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(mockError);
    });
  });
});
