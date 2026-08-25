import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type React from "react";
import { getVariants } from "../../endpoints/getVariants";
import { useVariantsQuery } from "../useVariantsQuery";

jest.mock("../../endpoints/getVariants", () => ({
  getVariants: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useVariantsQuery", () => {
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

  it("fetches product variants with queryKey ['variants']", async () => {
    const mockVariants = [
      {
        id: "var-1",
        name: "Size",
        description: "Drink cup size",
        options: [
          { id: "opt-1", name: "Regular", priceAdjustment: 0 },
          { id: "opt-2", name: "Large", priceAdjustment: 5000 },
        ],
      },
      {
        id: "var-2",
        name: "Sugar Level",
        description: "Sweetness preference",
        options: [
          { id: "opt-3", name: "Less Sugar", priceAdjustment: 0 },
          { id: "opt-4", name: "Normal", priceAdjustment: 0 },
        ],
      },
    ];

    (getVariants as jest.Mock).mockResolvedValue(mockVariants);

    const { result } = await renderHook(() => useVariantsQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getVariants).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockVariants);
  });

  it("handles error when getVariants fails", async () => {
    const mockError = new Error("Failed to load variants");
    (getVariants as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useVariantsQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(mockError);
  });
});
