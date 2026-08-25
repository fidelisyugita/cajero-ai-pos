import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { restoreProduct } from "../../endpoints/restoreProduct";
import { LocalProductService } from "../../LocalProductService";
import { useRestoreProductMutation } from "../useRestoreProductMutation";

jest.mock("../../endpoints/restoreProduct", () => ({
  restoreProduct: jest.fn(),
}));

jest.mock("../../LocalProductService", () => ({
  LocalProductService: {
    restoreProduct: jest.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useRestoreProductMutation", () => {
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

  it("successfully restores product, restores locally, and invalidates queries", async () => {
    (restoreProduct as jest.Mock).mockResolvedValue(true);
    (LocalProductService.restoreProduct as jest.Mock).mockResolvedValue(true);
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useRestoreProductMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync("prod-to-restore");
    });

    expect(restoreProduct).toHaveBeenCalledWith("prod-to-restore");
    expect(LocalProductService.restoreProduct).toHaveBeenCalledWith("prod-to-restore");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["products"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["product"] });
    expect(mutationResult).toBe(true);
  });

  it("propagates error when restoreProduct fails", async () => {
    const error = new Error("Failed to restore product on server");
    (restoreProduct as jest.Mock).mockRejectedValue(error);

    const { result } = await renderHook(() => useRestoreProductMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(result.current.mutateAsync("prod-failed")).rejects.toEqual(error);
    });

    expect(LocalProductService.restoreProduct).not.toHaveBeenCalled();
  });
});
