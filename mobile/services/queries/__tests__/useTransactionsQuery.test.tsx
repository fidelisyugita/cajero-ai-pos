import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type React from "react";
import { LocalTransactionService } from "../../LocalTransactionService";
import { useTransactionsQuery } from "../useTransactionsQuery";

jest.mock("../../LocalTransactionService", () => ({
  LocalTransactionService: {
    getTransactions: jest.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useTransactionsQuery", () => {
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

  it("fetches first page of transactions using LocalTransactionService", async () => {
    const mockItems = Array.from({ length: 20 }, (_, i) => ({
      id: `trx-${i + 1}`,
      totalPrice: 25000,
      createdAt: "2026-08-25T10:00:00.000Z",
    }));

    (LocalTransactionService.getTransactions as jest.Mock).mockResolvedValue(mockItems);

    const { result } = await renderHook(
      () =>
        useTransactionsQuery({
          search: "Latte",
          startDate: "2026-08-01",
          endDate: "2026-08-25",
          size: 20,
        }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(LocalTransactionService.getTransactions).toHaveBeenCalledWith({
      search: "Latte",
      startDate: "2026-08-01",
      endDate: "2026-08-25",
      page: 0,
      size: 20,
    });

    expect(result.current.data?.pages[0].content).toHaveLength(20);
    expect(result.current.hasNextPage).toBe(true);
  });

  it("handles pagination with getNextPageParam and fetchNextPage", async () => {
    const firstPageItems = Array.from({ length: 20 }, (_, i) => ({
      id: `trx-page1-${i}`,
      totalPrice: 30000,
    }));
    const secondPageItems = Array.from({ length: 5 }, (_, i) => ({
      id: `trx-page2-${i}`,
      totalPrice: 30000,
    }));

    (LocalTransactionService.getTransactions as jest.Mock)
      .mockResolvedValueOnce(firstPageItems)
      .mockResolvedValueOnce(secondPageItems);

    const { result } = await renderHook(() => useTransactionsQuery({ size: 20 }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    expect(LocalTransactionService.getTransactions).toHaveBeenLastCalledWith({
      page: 1,
      size: 20,
    });

    // Second page only returned 5 items (< size 20), so hasNextPage is now false
    expect(result.current.hasNextPage).toBe(false);
  });
});
