import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type React from "react";
import { postSignInOwner, postSignInStaff } from "../../endpoints/postSignIn";
import type { SignInResponse } from "../../types/Auth";
import { useSignInOwnerMutation, useSignInStaffMutation } from "../useSignInMutation";

jest.mock("../../endpoints/postSignIn", () => ({
  postSignInOwner: jest.fn(),
  postSignInStaff: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useSignInMutation", () => {
  let queryClient: QueryClient;

  const mockUserResponse: SignInResponse = {
    id: "user-1",
    name: "Owner User",
    email: "owner@cajero.com",
    phone: null,
    storeId: "store-1",
    roleCode: "OWNER",
    imageUrl: null,
    accessToken: "jwt-owner-token",
    refreshToken: "jwt-refresh-token",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
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

  afterEach(() => {
    queryClient.clear();
  });

  describe("useSignInOwnerMutation", () => {
    it("successfully calls postSignInOwner with email and password", async () => {
      (postSignInOwner as jest.Mock).mockResolvedValue(mockUserResponse);

      const { result } = await renderHook(() => useSignInOwnerMutation(), {
        wrapper: createWrapper(queryClient),
      });

      let res: any;
      await act(async () => {
        res = await result.current.mutateAsync({
          email: "owner@cajero.com",
          password: "password123",
        });
      });

      expect(postSignInOwner).toHaveBeenCalledWith({
        email: "owner@cajero.com",
        password: "password123",
      });
      expect(res).toEqual(mockUserResponse);
    });

    it("rejects when postSignInOwner throws error", async () => {
      const authError = new Error("Invalid email or password");
      (postSignInOwner as jest.Mock).mockRejectedValue(authError);

      const { result } = await renderHook(() => useSignInOwnerMutation(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await expect(
          result.current.mutateAsync({
            email: "wrong@cajero.com",
            password: "wrong",
          }),
        ).rejects.toThrow("Invalid email or password");
      });
    });
  });

  describe("useSignInStaffMutation", () => {
    it("successfully calls postSignInStaff with credentials", async () => {
      const mockStaffResponse = { ...mockUserResponse, roleCode: "CASHIER" };
      (postSignInStaff as jest.Mock).mockResolvedValue(mockStaffResponse);

      const { result } = await renderHook(() => useSignInStaffMutation(), {
        wrapper: createWrapper(queryClient),
      });

      let res: any;
      await act(async () => {
        res = await result.current.mutateAsync({
          email: "staff@cajero.com",
          password: "password123",
        });
      });

      expect(postSignInStaff).toHaveBeenCalledWith({
        email: "staff@cajero.com",
        password: "password123",
      });
      expect(res).toEqual(mockStaffResponse);
    });

    it("rejects when postSignInStaff throws error", async () => {
      (postSignInStaff as jest.Mock).mockRejectedValue(new Error("Invalid email or password"));

      const { result } = await renderHook(() => useSignInStaffMutation(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await expect(
          result.current.mutateAsync({
            email: "wrong@cajero.com",
            password: "wrong",
          }),
        ).rejects.toThrow("Invalid email or password");
      });
    });
  });
});
