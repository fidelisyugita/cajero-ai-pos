import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type React from "react";
import { LocalTransactionService } from "@/services/LocalTransactionService";
import { useTransactionQuery } from "../useTransactionQuery";

jest.mock("@/services/LocalTransactionService", () => ({
  LocalTransactionService: {
    getTransactionById: jest.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useTransactionQuery", () => {
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

  it("fetches single transaction by id from LocalTransactionService", async () => {
    const mockTransaction = {
      id: "txn-123",
      storeId: "store-1",
      totalPrice: 50000,
      statusCode: "COMPLETED",
      transactionProduct: [
        {
          id: "item-1",
          name: "Latte",
          quantity: 2,
          sellingPrice: 25000,
        },
      ],
    };

    (LocalTransactionService.getTransactionById as jest.Mock).mockResolvedValue(mockTransaction);

    const { result } = await renderHook(() => useTransactionQuery("txn-123"), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(LocalTransactionService.getTransactionById).toHaveBeenCalledWith("txn-123");
    expect(result.current.data).toEqual(mockTransaction);
  });

  it("is disabled when id is empty", async () => {
    const { result } = await renderHook(() => useTransactionQuery(""), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(LocalTransactionService.getTransactionById).not.toHaveBeenCalled();
  });

  it("handles error when LocalTransactionService throws", async () => {
    const mockError = new Error("Database transaction lookup failed");
    (LocalTransactionService.getTransactionById as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useTransactionQuery("txn-err"), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(mockError);
  });
});
