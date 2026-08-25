import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type React from "react";
import { getStore } from "@/services/endpoints/getStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { STORE_QUERY_KEY, useStoreQuery } from "../useStoreQuery";

jest.mock("@/services/endpoints/getStore", () => ({
  getStore: jest.fn(),
}));

const createWrapper = (client: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe("useStoreQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: undefined,
      isLoggedIn: false,
    });
    useBusinessStore.setState({
      business: null,
    });
  });

  it("exports STORE_QUERY_KEY correctly", () => {
    expect(STORE_QUERY_KEY).toEqual(["store"]);
  });

  it("fetches store details and updates useBusinessStore when storeId exists", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const mockStore = {
      id: "store-123",
      name: "Central Coffee POS",
      address: "Jl. Sudirman No. 10",
      phone: "081234567890",
      email: "central@coffee.com",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    useAuthStore.setState({
      user: {
        id: "user-1",
        name: "Store Owner",
        email: "owner@coffee.com",
        phone: null,
        storeId: "store-123",
        roleCode: "OWNER",
        imageUrl: null,
        accessToken: "token",
        refreshToken: "refresh",
        createdAt: null,
        updatedAt: null,
      },
      isLoggedIn: true,
    });

    (getStore as jest.Mock).mockResolvedValue(mockStore);

    const { result } = await renderHook(() => useStoreQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getStore).toHaveBeenCalledWith("store-123");
    expect(result.current.data).toEqual(mockStore);
    expect(useBusinessStore.getState().business).toEqual(mockStore);
  });

  it("is disabled when user does not have a storeId", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    useAuthStore.setState({
      user: undefined,
      isLoggedIn: false,
    });

    const { result } = await renderHook(() => useStoreQuery(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getStore).not.toHaveBeenCalled();
    expect(useBusinessStore.getState().business).toBeNull();
  });

  it("handles error when getStore fails", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const mockError = new Error("Failed to fetch store");
    useAuthStore.setState({
      user: {
        id: "user-1",
        name: "Store Owner",
        email: "owner@coffee.com",
        phone: null,
        storeId: "store-err",
        roleCode: "OWNER",
        imageUrl: null,
        accessToken: "token",
        refreshToken: "refresh",
        createdAt: null,
        updatedAt: null,
      },
      isLoggedIn: true,
    });

    (getStore as jest.Mock).mockRejectedValue(mockError);

    const hook = await renderHook(() => useStoreQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      hook.rerender({});
      expect(hook.result.current.isError).toBe(true);
    });
    expect(hook.result.current.error).toEqual(mockError);
  });
});
