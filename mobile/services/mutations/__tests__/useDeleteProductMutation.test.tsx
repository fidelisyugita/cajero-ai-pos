import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { deleteProduct } from "../../endpoints/deleteProduct";
import { LocalProductService } from "../../LocalProductService";
import { useDeleteProductMutation } from "../useDeleteProductMutation";

jest.mock("../../endpoints/deleteProduct", () => ({
  deleteProduct: jest.fn(),
}));

jest.mock("../../LocalProductService", () => ({
  LocalProductService: {
    softDeleteProduct: jest.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useDeleteProductMutation", () => {
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

  it("successfully deletes product, soft deletes locally, and invalidates queries", async () => {
    (deleteProduct as jest.Mock).mockResolvedValue(true);
    (LocalProductService.softDeleteProduct as jest.Mock).mockResolvedValue(true);
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useDeleteProductMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync("prod-to-delete");
    });

    expect(deleteProduct).toHaveBeenCalledWith("prod-to-delete");
    expect(LocalProductService.softDeleteProduct).toHaveBeenCalledWith("prod-to-delete");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["product-categories"] });
    expect(mutationResult).toBe(true);
  });

  it("propagates error when deleteProduct fails", async () => {
    const error = new Error("Failed to delete product on server");
    (deleteProduct as jest.Mock).mockRejectedValue(error);

    const { result } = await renderHook(() => useDeleteProductMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(result.current.mutateAsync("prod-failed")).rejects.toEqual(error);
    });

    expect(LocalProductService.softDeleteProduct).not.toHaveBeenCalled();
  });
});
