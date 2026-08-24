import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { stockUpdate } from "../../endpoints/stockUpdate";
import Logger from "../../logger";
import { useUpdateVariantStockMutation } from "../useUpdateVariantStockMutation";

jest.mock("../../endpoints/stockUpdate", () => ({
  stockUpdate: jest.fn(),
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

describe("useUpdateVariantStockMutation", () => {
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

  it("successfully calls stockUpdate with VARIANT type and invalidates variants query", async () => {
    (stockUpdate as jest.Mock).mockResolvedValue({ success: true });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useUpdateVariantStockMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync({
        id: "variant-1",
        stock: 25,
        reason: "Stock arrival",
      });
    });

    expect(Logger.log).toHaveBeenCalledWith("Updating variant stock:", {
      id: "variant-1",
      stock: 25,
      reason: "Stock arrival",
    });
    expect(stockUpdate).toHaveBeenCalledWith({
      id: "variant-1",
      type: "VARIANT",
      newStock: 25,
      reason: "Stock arrival",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["variants"] });
    expect(mutationResult).toEqual({ success: true });
  });

  it("handles error without response object", async () => {
    const genericError = new Error("Network timeout");
    (stockUpdate as jest.Mock).mockRejectedValue(genericError);

    const { result } = await renderHook(() => useUpdateVariantStockMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          id: "variant-2",
          stock: 10,
        }),
      ).rejects.toEqual(genericError);
    });

    expect(Logger.error).toHaveBeenCalledWith("Failed to update variant stock:", genericError);
  });

  it("handles API error with response data and status logging", async () => {
    const errorWithResponse = {
      response: {
        data: { message: "Variant not found" },
        status: 404,
      },
    };
    (stockUpdate as jest.Mock).mockRejectedValue(errorWithResponse);

    const { result } = await renderHook(() => useUpdateVariantStockMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          id: "variant-3",
          stock: 5,
        }),
      ).rejects.toEqual(errorWithResponse);
    });

    expect(Logger.error).toHaveBeenCalledWith("Failed to update variant stock:", errorWithResponse);
    expect(Logger.error).toHaveBeenCalledWith("Error data:", {
      message: "Variant not found",
    });
    expect(Logger.error).toHaveBeenCalledWith("Error status:", 404);
  });
});
