import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import api from "@/lib/axios";
import { useDeleteVariantMutation } from "../useDeleteVariantMutation";

jest.mock("@/lib/axios", () => ({
  __esModule: true,
  default: {
    delete: jest.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useDeleteVariantMutation", () => {
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

  it("successfully deletes variant and invalidates variants query", async () => {
    const mockDeletedVariant = { id: "var-to-delete", name: "Temperature" };
    (api.delete as jest.Mock).mockResolvedValue({ data: mockDeletedVariant });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useDeleteVariantMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync("var-to-delete");
    });

    expect(api.delete).toHaveBeenCalledWith("/variant/var-to-delete");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["variants"] });
    expect(mutationResult).toEqual(mockDeletedVariant);
  });

  it("propagates error when api.delete fails", async () => {
    const mockError = new Error("Cannot delete variant in active use");
    (api.delete as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useDeleteVariantMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(result.current.mutateAsync("var-fail")).rejects.toEqual(mockError);
    });
  });
});
