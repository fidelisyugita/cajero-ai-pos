import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { db } from "@/db/drizzle";
import { stockUpdate } from "../../endpoints/stockUpdate";
import Logger from "../../logger";
import { useUpdateProductStockMutation } from "../useUpdateProductStockMutation";

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

// Mock drizzle db update chaining
const createMockQueryBuilder = () => {
  const builder: any = {};
  builder.set = jest.fn().mockReturnValue(builder);
  builder.where = jest.fn().mockResolvedValue({ rowsAffected: 1 });
  return builder;
};

let mockDbBuilder = createMockQueryBuilder();

jest.mock("@/db/drizzle", () => ({
  db: {
    update: jest.fn(() => mockDbBuilder),
  },
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useUpdateProductStockMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDbBuilder = createMockQueryBuilder();
    (db.update as jest.Mock).mockReturnValue(mockDbBuilder);

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

  it("successfully updates stock endpoint, updates local DB, and invalidates queries", async () => {
    (stockUpdate as jest.Mock).mockResolvedValue({ success: true });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useUpdateProductStockMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync({
        id: "prod-101",
        stock: 50,
        reason: "Restocked shipment",
      });
    });

    expect(stockUpdate).toHaveBeenCalledWith({
      id: "prod-101",
      type: "PRODUCT",
      newStock: 50,
      reason: "Restocked shipment",
    });
    expect(db.update).toHaveBeenCalled();
    expect(mockDbBuilder.set).toHaveBeenCalledWith(
      expect.objectContaining({
        stock: 50,
        updatedAt: expect.any(Date),
      }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["product", "prod-101"] });
    expect(mutationResult).toEqual({ success: true });
  });

  it("handles local db update failure gracefully in onSuccess", async () => {
    (stockUpdate as jest.Mock).mockResolvedValue({ success: true });
    mockDbBuilder.where.mockRejectedValueOnce(new Error("Local DB locked"));

    const { result } = await renderHook(() => useUpdateProductStockMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: "prod-102",
        stock: 10,
      });
    });

    expect(Logger.error).toHaveBeenCalledWith(
      "Failed to update local db product:",
      expect.any(Error),
    );
  });

  it("handles stockUpdate endpoint failure with response error logging", async () => {
    const errorWithResponse = {
      response: {
        data: { message: "Negative stock not allowed" },
        status: 400,
      },
    };
    (stockUpdate as jest.Mock).mockRejectedValue(errorWithResponse);

    const { result } = await renderHook(() => useUpdateProductStockMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          id: "prod-103",
          stock: -5,
        }),
      ).rejects.toEqual(errorWithResponse);
    });

    expect(Logger.error).toHaveBeenCalledWith("Failed to update product stock:", errorWithResponse);
    expect(Logger.error).toHaveBeenCalledWith("Error data:", {
      message: "Negative stock not allowed",
    });
    expect(Logger.error).toHaveBeenCalledWith("Error status:", 400);
  });
});
