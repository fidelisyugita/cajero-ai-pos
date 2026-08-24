import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type React from "react";
import { LocalTransactionService } from "../../LocalTransactionService";
import Logger from "../../logger";
import { SyncService } from "../../SyncService";
import { useCreateTransactionMutation } from "../useCreateTransactionMutation";

jest.mock("../../LocalTransactionService", () => ({
  LocalTransactionService: {
    createTransaction: jest.fn(),
  },
}));

jest.mock("../../SyncService", () => ({
  SyncService: {
    pushTransactions: jest.fn(),
  },
}));

jest.mock("../../logger", () => ({
  __esModule: true,
  default: {
    log: jest.fn(),
    error: jest.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useCreateTransactionMutation", () => {
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

  it("successfully creates transaction, triggers background sync, and invalidates queries", async () => {
    const mockTransactionData = {
      items: [{ productId: "p-1", quantity: 2, price: 10000 }],
      paymentMethodCode: "CASH",
      totalPrice: 20000,
    };
    const mockResult = { id: "trx-101", ...mockTransactionData };

    (LocalTransactionService.createTransaction as jest.Mock).mockResolvedValue(mockResult);
    (SyncService.pushTransactions as jest.Mock).mockResolvedValue(undefined);

    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useCreateTransactionMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync(mockTransactionData);
    });

    expect(mutationResult).toEqual(mockResult);
    expect(LocalTransactionService.createTransaction).toHaveBeenCalledWith(mockTransactionData);
    expect(SyncService.pushTransactions).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["transactions"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
  });

  it("handles pushTransactions failure without throwing an error in mutation", async () => {
    const mockTransactionData = { id: "trx-102", totalPrice: 15000 };
    (LocalTransactionService.createTransaction as jest.Mock).mockResolvedValue(mockTransactionData);
    const syncError = new Error("Network unreachable");
    (SyncService.pushTransactions as jest.Mock).mockRejectedValue(syncError);

    const { result } = await renderHook(() => useCreateTransactionMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync(mockTransactionData);
    });

    expect(mutationResult).toEqual(mockTransactionData);

    await waitFor(() => {
      expect(Logger.error).toHaveBeenCalledWith("Push transaction failed", syncError);
    });
  });

  it("fails when LocalTransactionService.createTransaction throws", async () => {
    const dbError = new Error("DB write failure");
    (LocalTransactionService.createTransaction as jest.Mock).mockRejectedValue(dbError);

    const { result } = await renderHook(() => useCreateTransactionMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(result.current.mutateAsync({ id: "fail" })).rejects.toThrow("DB write failure");
    });
  });
});
