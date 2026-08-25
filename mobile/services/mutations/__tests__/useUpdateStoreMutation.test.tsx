import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import api from "@/lib/axios";
import { STORE_QUERY_KEY } from "@/services/queries/useStoreQuery";
import type { Store } from "@/services/types/Store";
import { useUpdateStoreMutation } from "../useUpdateStoreMutation";

jest.mock("@/lib/axios", () => ({
  __esModule: true,
  default: {
    put: jest.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useUpdateStoreMutation", () => {
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

  it("successfully updates store and invalidates store query with storeId", async () => {
    const storeId = "store-123";
    const updatePayload: Partial<Store> = {
      name: "Updated Cajero Store",
      phone: "+628123456789",
    };
    const mockResponseData = { id: storeId, ...updatePayload };
    (api.put as jest.Mock).mockResolvedValue({ data: mockResponseData });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useUpdateStoreMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync({
        id: storeId,
        data: updatePayload,
      });
    });

    expect(api.put).toHaveBeenCalledWith("/store", {
      ...updatePayload,
      id: storeId,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [...STORE_QUERY_KEY, storeId],
    });
    expect(mutationResult).toEqual(mockResponseData);
  });

  it("propagates error when api.put fails", async () => {
    const mockError = new Error("Failed to update store");
    (api.put as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useUpdateStoreMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          id: "store-123",
          data: { name: "New Name" },
        }),
      ).rejects.toEqual(mockError);
    });
  });
});
