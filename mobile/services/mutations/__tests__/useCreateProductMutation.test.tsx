import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { postProduct } from "../../endpoints/postProduct";
import type { CreateProductRequest } from "../../types/Product";
import { useCreateProductMutation } from "../useCreateProductMutation";

jest.mock("../../endpoints/postProduct", () => ({
  postProduct: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useCreateProductMutation", () => {
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

  it("successfully posts product and invalidates products query", async () => {
    const mockProductPayload: CreateProductRequest = {
      name: "Americano",
      sellingPrice: 25000,
      buyingPrice: 10000,
      categoryCode: "COFFEE",
      stock: 100,
    };
    const mockCreatedResponse = { id: "p-1", ...mockProductPayload };
    (postProduct as jest.Mock).mockResolvedValue(mockCreatedResponse);
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useCreateProductMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync(mockProductPayload);
    });

    expect(postProduct).toHaveBeenCalledWith(mockProductPayload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
    expect(mutationResult).toEqual(mockCreatedResponse);
  });

  it("propagates error when postProduct fails", async () => {
    const mockError = new Error("Product code already exists");
    (postProduct as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useCreateProductMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          name: "Invalid Item",
          sellingPrice: 10000,
          buyingPrice: 5000,
          categoryCode: "FOOD",
          stock: 0,
        }),
      ).rejects.toEqual(mockError);
    });
  });
});
