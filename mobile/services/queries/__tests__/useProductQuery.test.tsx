import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type React from "react";
import { getProduct } from "../../endpoints/getProduct";
import { useProductQuery } from "../useProductQuery";

jest.mock("../../endpoints/getProduct", () => ({
  getProduct: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useProductQuery", () => {
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

  it("fetches single product data when id is valid and enabled is true", async () => {
    const mockProduct = {
      id: "prod-1",
      name: "Espresso",
      sellingPrice: 18000,
      buyingPrice: 8000,
      stock: 100,
    };

    (getProduct as jest.Mock).mockResolvedValue(mockProduct);

    const { result } = await renderHook(() => useProductQuery("prod-1"), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getProduct).toHaveBeenCalledWith("prod-1");
    expect(result.current.data).toEqual(mockProduct);
  });

  it("does not fetch when id is empty", async () => {
    const { result } = await renderHook(() => useProductQuery(""), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getProduct).not.toHaveBeenCalled();
  });

  it("does not fetch when enabled flag is explicitly false", async () => {
    const { result } = await renderHook(() => useProductQuery("prod-1", false), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getProduct).not.toHaveBeenCalled();
  });

  it("handles error when getProduct fails", async () => {
    const mockError = new Error("Product not found");
    (getProduct as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useProductQuery("prod-unknown"), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(mockError);
  });
});
