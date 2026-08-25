import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type React from "react";
import { getUsers } from "../../endpoints/getUsers";
import { USERS_QUERY_KEY, useUsersQuery } from "../useUsersQuery";

jest.mock("../../endpoints/getUsers", () => ({
  getUsers: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useUsersQuery", () => {
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

  it("exports USERS_QUERY_KEY correctly", () => {
    expect(USERS_QUERY_KEY).toEqual(["users"]);
  });

  it("fetches user list successfully", async () => {
    const mockUsers = [
      {
        id: "u-1",
        name: "John Doe",
        email: "john@example.com",
        role: "CASHIER",
        storeId: "store-1",
      },
      {
        id: "u-2",
        name: "Jane Smith",
        email: "jane@example.com",
        role: "MANAGER",
        storeId: "store-1",
      },
    ];

    (getUsers as jest.Mock).mockResolvedValue(mockUsers);

    const { result } = await renderHook(() => useUsersQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getUsers).toHaveBeenCalled();
    expect(result.current.data).toEqual(mockUsers);
  });

  it("handles error when getUsers fails", async () => {
    const mockError = new Error("Failed to fetch users");
    (getUsers as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useUsersQuery(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(mockError);
  });
});
