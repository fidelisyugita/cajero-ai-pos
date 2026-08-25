import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type React from "react";
import { LocalProductService } from "../../LocalProductService";
import { useProductsQuery } from "../useProductsQuery";

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

describe("useProductsQuery", () => {
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

  it("fetches products from LocalProductService with given parameters and formats page response", async () => {
    const mockProducts = [
      { id: "p-1", name: "Americano", price: 20000 },
      { id: "p-2", name: "Croissant", price: 15000 },
    ];

    (LocalProductService.getProducts as jest.Mock).mockResolvedValue(mockProducts);

    const params = {
      keyword: "Amer",
      categoryCode: "COFFEE",
      includeDeleted: false,
    };

    const { result } = await renderHook(() => useProductsQuery(params), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(LocalProductService.getProducts).toHaveBeenCalledWith("Amer", "COFFEE", 0, 1000, false);

    expect(result.current.data).toEqual({
      content: mockProducts,
      totalElements: 2,
      totalPages: 1,
      size: 2,
      number: 0,
    });
  });

  it("handles empty products list gracefully", async () => {
    (LocalProductService.getProducts as jest.Mock).mockResolvedValue([]);

    const { result } = await renderHook(() => useProductsQuery({ keyword: "NonExistent" }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      content: [],
      totalElements: 0,
      totalPages: 1,
      size: 0,
      number: 0,
    });
  });
});
