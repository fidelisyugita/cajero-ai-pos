import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type React from "react";
import { getStockMovements } from "../../endpoints/getStockMovements";
import { useStockMovementsQuery } from "../useStockMovementsQuery";

jest.mock("../../endpoints/getStockMovements", () => ({
  getStockMovements: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useStockMovementsQuery", () => {
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

  it("fetches initial stock movements page and paginates to next page", async () => {
    const page0 = {
      content: [{ id: "sm-1", productName: "Coffee", quantity: 10 }],
      number: 0,
      totalPages: 2,
      last: false,
    };
    const page1 = {
      content: [{ id: "sm-2", productName: "Tea", quantity: 5 }],
      number: 1,
      totalPages: 2,
      last: true,
    };

    (getStockMovements as jest.Mock).mockResolvedValueOnce(page0).mockResolvedValueOnce(page1);

    const params = { productId: "prod-1" };
    const { result } = await renderHook(() => useStockMovementsQuery(params), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getStockMovements).toHaveBeenCalledWith({
      productId: "prod-1",
      page: 0,
    });
    expect(result.current.data?.pages[0]).toEqual(page0);
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    expect(getStockMovements).toHaveBeenCalledWith({
      productId: "prod-1",
      page: 1,
    });
    expect(result.current.data?.pages[1]).toEqual(page1);
    expect(result.current.hasNextPage).toBe(false);
  });

  it("returns undefined for getNextPageParam when lastPage.last is true", async () => {
    const singlePage = {
      content: [{ id: "sm-1", productName: "Milk", quantity: 20 }],
      number: 0,
      totalPages: 1,
      last: true,
    };

    (getStockMovements as jest.Mock).mockResolvedValueOnce(singlePage);

    const { result } = await renderHook(() => useStockMovementsQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it("returns undefined for getNextPageParam when lastPage is at the end of totalPages", async () => {
    const page = {
      content: [{ id: "sm-1" }],
      number: 1,
      totalPages: 2,
      last: false,
    };

    (getStockMovements as jest.Mock).mockResolvedValueOnce(page);

    const { result } = await renderHook(() => useStockMovementsQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it("handles error when getStockMovements fails", async () => {
    const mockError = new Error("Failed to get stock movements");
    (getStockMovements as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useStockMovementsQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(mockError);
  });
});
