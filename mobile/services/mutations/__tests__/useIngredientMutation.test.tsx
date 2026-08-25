import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { type CreateIngredientRequest, postIngredient } from "../../endpoints/postIngredient";
import { useAddIngredientMutation } from "../useIngredientMutation";

jest.mock("../../endpoints/postIngredient", () => ({
  postIngredient: jest.fn(),
}));

describe("useIngredientMutation (useAddIngredientMutation wrapper)", () => {
  let queryClient: QueryClient;

  const createWrapper = (client: QueryClient) => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it("calls postIngredient and returns created ingredient", async () => {
    const mockRequest: CreateIngredientRequest = {
      name: "Vanilla Syrup",
      description: "Flavoring syrup",
      stock: 100,
      measureUnitCode: "ML",
    };

    const mockResponse = {
      id: "ing-100",
      name: "Vanilla Syrup",
      description: "Flavoring syrup",
      stock: 100,
      measureUnitCode: "ML",
      storeId: "store-1",
      createdAt: "2026-03-01T10:00:00.000Z",
      updatedAt: "2026-03-01T10:00:00.000Z",
      deletedAt: "",
      createdBy: "u-1",
      updatedBy: "u-1",
    };

    (postIngredient as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = await renderHook(() => useAddIngredientMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync(mockRequest);
    });

    expect(postIngredient).toHaveBeenCalledWith(mockRequest);
    expect(mutationResult).toEqual(mockResponse);
  });

  it("propagates error when postIngredient fails", async () => {
    const mockError = new Error("Failed to add ingredient");
    (postIngredient as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useAddIngredientMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          name: "Sugar Syrup",
          description: "Liquid sugar",
          stock: 50,
          measureUnitCode: "ML",
        }),
      ).rejects.toEqual(mockError);
    });
  });
});
