import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { postIngredient } from "../../endpoints/postIngredient";
import type { CreateIngredientRequest } from "../../types/Ingredient";
import { useCreateIngredientMutation } from "../useCreateIngredientMutation";

jest.mock("../../endpoints/postIngredient", () => ({
  postIngredient: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useCreateIngredientMutation", () => {
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

  it("successfully creates ingredient and invalidates ingredients query", async () => {
    const payload: CreateIngredientRequest = {
      name: "Coffee Beans Arabica",
      description: "Arabica beans for espresso",
      measureUnitCode: "GR",
      stock: 5000,
    };
    const mockResponse = { id: "ing-100", ...payload };
    (postIngredient as jest.Mock).mockResolvedValue(mockResponse);
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useCreateIngredientMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync(payload);
    });

    expect(postIngredient).toHaveBeenCalledWith(payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["ingredients"] });
    expect(mutationResult).toEqual(mockResponse);
  });

  it("propagates error when postIngredient fails", async () => {
    const mockError = new Error("Duplicate ingredient name");
    (postIngredient as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useCreateIngredientMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          name: "Duplicate",
          description: "Duplicate item",
          measureUnitCode: "ML",
          stock: 100,
        }),
      ).rejects.toEqual(mockError);
    });
  });
});
