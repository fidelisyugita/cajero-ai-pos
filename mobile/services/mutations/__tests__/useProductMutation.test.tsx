import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { postProduct } from "../../endpoints/postProduct";
import type { CreateProductRequest } from "../../types/Product";
import { useAddProductMutation } from "../useProductMutation";

jest.mock("../../endpoints/postProduct", () => ({
  postProduct: jest.fn(),
}));

describe("useProductMutation (useAddProductMutation wrapper)", () => {
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

  it("calls postProduct and returns created product", async () => {
    const mockRequest: CreateProductRequest = {
      name: "Cold Brew",
      categoryCode: "COFFEE",
      buyingPrice: 15000,
      sellingPrice: 35000,
      stock: 50,
    };

    const mockResponse = {
      id: "prod-100",
      name: "Cold Brew",
      categoryCode: "COFFEE",
      buyingPrice: 15000,
      sellingPrice: 35000,
      stock: 50,
      storeId: "store-1",
    };

    (postProduct as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = await renderHook(() => useAddProductMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync(mockRequest);
    });

    expect(postProduct).toHaveBeenCalledWith(mockRequest);
    expect(mutationResult).toEqual(mockResponse);
  });

  it("propagates error when postProduct fails", async () => {
    const mockError = new Error("Failed to add product");
    (postProduct as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useAddProductMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          name: "Iced Latte",
          categoryCode: "COFFEE",
          buyingPrice: 12000,
          sellingPrice: 30000,
          stock: 40,
        }),
      ).rejects.toEqual(mockError);
    });
  });
});
