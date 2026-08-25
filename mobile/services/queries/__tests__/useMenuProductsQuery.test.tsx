import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type React from "react";
import { LocalProductService } from "../../LocalProductService";
import { useMenuProductsQuery } from "../useMenuProductsQuery";

jest.mock("../../LocalProductService", () => ({
  LocalProductService: {
    getProducts: jest.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useMenuProductsQuery", () => {
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

  it("fetches first page of menu products and handles search and category filters", async () => {
    const mockProducts = Array.from({ length: 100 }, (_, i) => ({
      id: `p-${i + 1}`,
      name: `Product ${i + 1}`,
      categoryId: "cat-1",
    }));

    (LocalProductService.getProducts as jest.Mock).mockResolvedValue(mockProducts);

    const { result } = await renderHook(() => useMenuProductsQuery("cat-1", "Coffee"), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(LocalProductService.getProducts).toHaveBeenCalledWith("Coffee", "cat-1", 0, 100);
    expect(result.current.data?.pages[0]).toHaveLength(100);
    expect(result.current.hasNextPage).toBe(true);
  });

  it("handles pagination flow and terminates when last page has fewer than 100 items", async () => {
    const firstPageProducts = Array.from({ length: 100 }, (_, i) => ({
      id: `p-${i + 1}`,
      name: `Product ${i + 1}`,
    }));
    const secondPageProducts = Array.from({ length: 25 }, (_, i) => ({
      id: `p-${100 + i + 1}`,
      name: `Product ${100 + i + 1}`,
    }));

    (LocalProductService.getProducts as jest.Mock)
      .mockResolvedValueOnce(firstPageProducts)
      .mockResolvedValueOnce(secondPageProducts);

    const { result } = await renderHook(() => useMenuProductsQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    expect(LocalProductService.getProducts).toHaveBeenLastCalledWith(undefined, undefined, 1, 100);

    // Second page length is 25 (< 100), so hasNextPage should now be false
    expect(result.current.hasNextPage).toBe(false);
  });
});
