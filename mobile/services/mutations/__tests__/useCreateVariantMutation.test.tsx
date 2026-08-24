import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import api from "@/lib/axios";
import { useCreateVariantMutation } from "../useCreateVariantMutation";

jest.mock("@/lib/axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useCreateVariantMutation", () => {
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

  it("successfully creates a variant with options and invalidates variants query", async () => {
    const payload = {
      productId: "prod-1",
      name: "Size",
      description: "Cup size",
      isRequired: true,
      isMultiple: false,
      options: [
        {
          name: "Large",
          priceAdjusment: 5000,
          stock: 50,
          ingredients: [{ ingredientId: "ing-1", quantityNeeded: 200 }],
        },
      ],
    };
    const mockResponse = { id: "var-1", ...payload };
    (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useCreateVariantMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync(payload);
    });

    expect(api.post).toHaveBeenCalledWith("/variant", payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["variants"] });
    expect(mutationResult).toEqual(mockResponse);
  });

  it("propagates error when api.post fails", async () => {
    const mockError = new Error("Validation error on variant options");
    (api.post as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useCreateVariantMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          productId: "prod-2",
          name: "Sugar Level",
          isRequired: false,
          isMultiple: false,
          options: [],
        }),
      ).rejects.toEqual(mockError);
    });
  });
});
