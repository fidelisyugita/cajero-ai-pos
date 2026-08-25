import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { db } from "@/db/drizzle";
import { updateProduct } from "../../endpoints/updateProduct";
import Logger from "../../logger";
import type { CreateProductRequest } from "../../types/Product";
import { useUpdateProductMutation } from "../useUpdateProductMutation";

jest.mock("../../endpoints/updateProduct", () => ({
  updateProduct: jest.fn(),
}));

jest.mock("../../logger", () => ({
  __esModule: true,
  default: {
    log: jest.fn(),
    error: jest.fn(),
  },
}));

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

describe("useUpdateProductMutation", () => {
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

  it("successfully updates product endpoint, updates local DB, and invalidates queries", async () => {
    const payload: CreateProductRequest = {
      name: "Updated Latte",
      sellingPrice: 35000,
      buyingPrice: 15000,
      categoryCode: "COFFEE",
      stock: 45,
    };
    const returnedProduct = {
      id: "prod-999",
      ...payload,
    };

    (updateProduct as jest.Mock).mockResolvedValue(returnedProduct);
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useUpdateProductMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync({
        id: "prod-999",
        data: payload,
      });
    });

    expect(updateProduct).toHaveBeenCalledWith("prod-999", payload);
    expect(db.update).toHaveBeenCalled();
    expect(mockDbBuilder.set).toHaveBeenCalledWith(
      expect.objectContaining({
        stock: 45,
        categoryId: "COFFEE",
        name: "Updated Latte",
        sellingPrice: 35000,
        buyingPrice: 15000,
        updatedAt: expect.any(Date),
      }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["product", "prod-999"],
    });
    expect(mutationResult).toEqual(returnedProduct);
  });

  it("handles local db update failure gracefully without throwing", async () => {
    const payload: CreateProductRequest = {
      name: "Mocha",
      sellingPrice: 30000,
      buyingPrice: 12000,
      categoryCode: "COFFEE",
      stock: 20,
    };
    const returnedProduct = { id: "prod-888", ...payload };

    (updateProduct as jest.Mock).mockResolvedValue(returnedProduct);
    mockDbBuilder.where.mockRejectedValueOnce(new Error("Local SQLite DB Locked"));

    const { result } = await renderHook(() => useUpdateProductMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: "prod-888",
        data: payload,
      });
    });

    expect(Logger.error).toHaveBeenCalledWith(
      "Failed to update local db product:",
      expect.any(Error),
    );
  });

  it("handles updateProduct endpoint failure with error data and status logging", async () => {
    const errorWithResponse = {
      response: {
        data: { message: "Invalid product data" },
        status: 422,
      },
    };
    (updateProduct as jest.Mock).mockRejectedValue(errorWithResponse);

    const { result } = await renderHook(() => useUpdateProductMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          id: "prod-777",
          data: {
            name: "Invalid",
            sellingPrice: -1,
            buyingPrice: 0,
            categoryCode: "TEST",
            stock: 0,
          },
        }),
      ).rejects.toEqual(errorWithResponse);
    });

    expect(Logger.error).toHaveBeenCalledWith("Failed to update product:", errorWithResponse);
    expect(Logger.error).toHaveBeenCalledWith("Error data:", {
      message: "Invalid product data",
    });
    expect(Logger.error).toHaveBeenCalledWith("Error status:", 422);
  });
});
