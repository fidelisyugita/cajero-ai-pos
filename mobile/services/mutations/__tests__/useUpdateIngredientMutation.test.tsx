import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { putIngredient } from "../../endpoints/putIngredient";
import Logger from "../../logger";
import type { CreateIngredientRequest } from "../../types/Ingredient";
import { useUpdateIngredientMutation } from "../useUpdateIngredientMutation";

jest.mock("../../endpoints/putIngredient", () => ({
  putIngredient: jest.fn(),
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

describe("useUpdateIngredientMutation", () => {
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

  it("successfully updates ingredient and invalidates ingredients query", async () => {
    const payload: CreateIngredientRequest = {
      name: "Fresh Whole Milk",
      description: "Whole cow milk",
      measureUnitCode: "ML",
      stock: 10000,
    };
    const mockResponse = { id: "ing-200", ...payload };
    (putIngredient as jest.Mock).mockResolvedValue(mockResponse);
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useUpdateIngredientMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync({
        id: "ing-200",
        data: payload,
      });
    });

    expect(putIngredient).toHaveBeenCalledWith("ing-200", payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["ingredients"] });
    expect(mutationResult).toEqual(mockResponse);
  });

  it("handles error during ingredient update and logs error", async () => {
    const mockError = new Error("Failed to update ingredient");
    (putIngredient as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useUpdateIngredientMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          id: "ing-300",
          data: {
            name: "Sugar",
            description: "Refined white sugar",
            measureUnitCode: "GR",
            stock: 2000,
          },
        }),
      ).rejects.toEqual(mockError);
    });

    expect(Logger.error).toHaveBeenCalledWith("Failed to update ingredient:", mockError);
  });
});
