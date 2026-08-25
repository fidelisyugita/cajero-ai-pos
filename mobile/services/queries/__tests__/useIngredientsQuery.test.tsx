import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type React from "react";
import { getIngredients } from "../../endpoints/getIngredients";
import { useIngredientsQuery } from "../useIngredientsQuery";

jest.mock("../../endpoints/getIngredients", () => ({
  getIngredients: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useIngredientsQuery", () => {
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

  it("fetches ingredients list successfully with queryKey ['ingredients']", async () => {
    const mockIngredients = [
      {
        id: "ing-1",
        name: "Coffee Beans",
        description: "House blend beans",
        measureUnitCode: "GR",
        stock: 1000,
      },
      {
        id: "ing-2",
        name: "Fresh Milk",
        description: "Whole milk",
        measureUnitCode: "ML",
        stock: 5000,
      },
    ];

    (getIngredients as jest.Mock).mockResolvedValue(mockIngredients);

    const { result } = await renderHook(() => useIngredientsQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getIngredients).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockIngredients);
  });

  it("handles error when getIngredients fails", async () => {
    const mockError = new Error("Failed to load ingredients");
    (getIngredients as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useIngredientsQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(mockError);
  });
});
