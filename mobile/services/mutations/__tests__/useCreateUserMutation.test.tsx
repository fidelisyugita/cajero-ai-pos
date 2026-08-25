import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { postUser } from "../../endpoints/postUser";
import type { CreateUserRequest } from "../../types/User";
import { useCreateUserMutation } from "../useCreateUserMutation";

jest.mock("../../endpoints/postUser", () => ({
  postUser: jest.fn(),
}));

describe("useCreateUserMutation", () => {
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

  it("calls postUser and invalidates users query cache", async () => {
    const mockRequest: CreateUserRequest = {
      name: "Cashier Bob",
      email: "bob@cajero.com",
      roleCode: "CASHIER",
      password: "password123",
      phone: "+62812345678",
    };

    const mockResponse = {
      id: "u-123",
      name: "Cashier Bob",
      email: "bob@cajero.com",
      roleCode: "CASHIER",
      storeId: "store-1",
      phone: "+62812345678",
    };

    (postUser as jest.Mock).mockResolvedValue(mockResponse);
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useCreateUserMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync(mockRequest);
    });

    expect(postUser).toHaveBeenCalledWith(mockRequest);
    expect(mutationResult).toEqual(mockResponse);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["users"],
    });
  });

  it("propagates error when postUser fails", async () => {
    const mockError = new Error("Email already registered");
    (postUser as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useCreateUserMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          name: "Duplicate User",
          email: "dup@cajero.com",
          roleCode: "CASHIER",
          password: "password123",
        }),
      ).rejects.toEqual(mockError);
    });
  });
});
