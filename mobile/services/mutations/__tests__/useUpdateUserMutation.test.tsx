import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { putUser } from "../../endpoints/putUser";
import type { CreateUserRequest } from "../../types/User";
import { useUpdateUserMutation } from "../useUpdateUserMutation";

jest.mock("../../endpoints/putUser", () => ({
  putUser: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useUpdateUserMutation", () => {
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

  it("successfully updates user and invalidates users and auth-user queries", async () => {
    const updateData: Partial<CreateUserRequest> = {
      name: "Jane Smith",
      roleCode: "MANAGER",
    };
    const mockResponse = { id: "user-10", ...updateData };
    (putUser as jest.Mock).mockResolvedValue(mockResponse);
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = await renderHook(() => useUpdateUserMutation(), {
      wrapper: createWrapper(queryClient),
    });

    let mutationResult: any;
    await act(async () => {
      mutationResult = await result.current.mutateAsync({
        id: "user-10",
        data: updateData,
      });
    });

    expect(putUser).toHaveBeenCalledWith("user-10", updateData);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["users"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["auth-user"] });
    expect(mutationResult).toEqual(mockResponse);
  });

  it("propagates error when putUser fails", async () => {
    const mockError = new Error("User not found");
    (putUser as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(() => useUpdateUserMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          id: "user-999",
          data: { name: "Nonexistent" },
        }),
      ).rejects.toEqual(mockError);
    });
  });
});
