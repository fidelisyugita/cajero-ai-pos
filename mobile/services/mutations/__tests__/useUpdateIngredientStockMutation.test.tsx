import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { stockUpdate } from "../../endpoints/stockUpdate";
import Logger from "../../logger";
import { useUpdateIngredientStockMutation } from "../useUpdateIngredientStockMutation";

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

describe("useUpdateIngredientStockMutation", () => {
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

  it("successfully updates ingredient stock and invalidates ingredients query", async () => {
    (stockUpdate as jest.Mock).mockResolvedValue({ success: true });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useUpdateIngredientStockMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync({
        id: "ing-10",
        stock: 1500,
        reason: "Supplier delivery",
      });
    });

    expect(stockUpdate).toHaveBeenCalledWith({
      id: "ing-10",
      type: "INGREDIENT",
      newStock: 1500,
      reason: "Supplier delivery",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["ingredients"] });
    expect(mutationResult).toEqual({ success: true });
  });

  it("handles error during ingredient stock update and logs error", async () => {
    const mockError = new Error("Database error");
    (stockUpdate as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useUpdateIngredientStockMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          id: "ing-20",
          stock: -10,
        }),
      ).rejects.toEqual(mockError);
    });

    expect(Logger.error).toHaveBeenCalledWith("Failed to update ingredient stock:", mockError);
  });
});
