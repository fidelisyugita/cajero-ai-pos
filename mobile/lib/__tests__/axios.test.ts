import axios from "axios";
import type { SignInResponse } from "@/services/types/Auth";
import { useAuthStore } from "@/store/useAuthStore";
import api from "../axios";

const mockUser: SignInResponse = {
  id: "user-1",
  name: "Test User",
  email: "user@example.com",
  phone: null,
  roleCode: "ADMIN",
  storeId: "store-1",
  imageUrl: null,
  accessToken: "access-token-123",
  refreshToken: "refresh-token-456",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("axios api instance and interceptors", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: undefined,
      isLoggedIn: false,
    });
    jest.clearAllMocks();
  });

  describe("request interceptor", () => {
    it("attaches Authorization header when user has accessToken", async () => {
      useAuthStore.setState({
        user: mockUser,
        isLoggedIn: true,
      });

      const headers = {
        set: jest.fn(),
      };
      const config = {
        headers,
      };

      const requestHandler = (api.interceptors.request as any).handlers[0].fulfilled;
      const modifiedConfig = requestHandler(config as any);

      expect(headers.set).toHaveBeenCalledWith("Authorization", "Bearer access-token-123");
      expect(modifiedConfig).toBe(config);
    });

    it("does not set Authorization header when user is not logged in", async () => {
      const headers = {
        set: jest.fn(),
      };
      const config = {
        headers,
      };

      const requestHandler = (api.interceptors.request as any).handlers[0].fulfilled;
      requestHandler(config as any);

      expect(headers.set).not.toHaveBeenCalled();
    });

    it("rejects request error", async () => {
      const error = new Error("Network error");
      const errorHandler = (api.interceptors.request as any).handlers[0].rejected;

      await expect(errorHandler(error)).rejects.toThrow("Network error");
    });
  });

  describe("response interceptor", () => {
    it("passes through successful responses untouched", () => {
      const response = { data: { message: "ok" }, status: 200 };
      const responseHandler = (api.interceptors.response as any).handlers[0].fulfilled;

      expect(responseHandler(response as any)).toBe(response);
    });

    it("refreshes token and retries request on 401 error", async () => {
      useAuthStore.setState({
        user: mockUser,
        isLoggedIn: true,
      });

      const postSpy = jest.spyOn(axios, "post").mockResolvedValueOnce({
        data: {
          accessToken: "new-access-token-789",
          refreshToken: "new-refresh-token-999",
        },
      });

      const originalHeaders = {
        set: jest.fn(),
      };
      const originalConfig: any = {
        url: "https://api.example.com/test",
        method: "get",
        headers: originalHeaders,
        _retry: false,
        adapter: jest.fn().mockResolvedValue({
          data: "retry-success",
          status: 200,
          headers: {},
          config: {},
        }),
      };

      const errorHandler = (api.interceptors.response as any).handlers[0].rejected;

      const error = {
        config: originalConfig,
        response: { status: 401 },
      };

      const retryResult = await errorHandler(error);

      expect(originalConfig._retry).toBe(true);
      expect(postSpy).toHaveBeenCalledWith(`${process.env.EXPO_PUBLIC_API_URL}/auth/refreshtoken`, {
        refreshToken: "refresh-token-456",
      });
      expect(originalHeaders.set).toHaveBeenCalledWith(
        "Authorization",
        "Bearer new-access-token-789",
      );
      expect(useAuthStore.getState().user?.accessToken).toBe("new-access-token-789");
      expect(useAuthStore.getState().user?.refreshToken).toBe("new-refresh-token-999");
      expect(retryResult.data).toBe("retry-success");

      postSpy.mockRestore();
    });

    it("deduplicates concurrent 401 requests and reuses the single refresh token response", async () => {
      useAuthStore.setState({
        user: mockUser,
        isLoggedIn: true,
      });

      let resolveRefresh: (value: any) => void = () => {};
      const refreshPromise = new Promise((resolve) => {
        resolveRefresh = resolve;
      });

      const postSpy = jest.spyOn(axios, "post").mockImplementationOnce(() => refreshPromise as any);

      const headers1 = { set: jest.fn() };
      const config1: any = {
        url: "/endpoint-1",
        method: "get",
        headers: headers1,
        _retry: false,
        adapter: jest.fn().mockResolvedValue({ data: "data-1", status: 200 }),
      };

      const headers2 = { set: jest.fn() };
      const config2: any = {
        url: "/endpoint-2",
        method: "get",
        headers: headers2,
        _retry: false,
        adapter: jest.fn().mockResolvedValue({ data: "data-2", status: 200 }),
      };

      const errorHandler = (api.interceptors.response as any).handlers[0].rejected;

      // Trigger first 401
      const req1Promise = errorHandler({
        config: config1,
        response: { status: 401 },
      });

      // Trigger second concurrent 401 while first is in flight
      const req2Promise = errorHandler({
        config: config2,
        response: { status: 401 },
      });

      expect(postSpy).toHaveBeenCalledTimes(1);

      // Now resolve the single refresh call
      resolveRefresh({
        data: {
          accessToken: "concurrent-new-token",
          refreshToken: "concurrent-new-refresh",
        },
      });

      const [res1, res2] = await Promise.all([req1Promise, req2Promise]);

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(headers1.set).toHaveBeenCalledWith("Authorization", "Bearer concurrent-new-token");
      expect(headers2.set).toHaveBeenCalledWith("Authorization", "Bearer concurrent-new-token");
      expect(res1.data).toBe("data-1");
      expect(res2.data).toBe("data-2");

      postSpy.mockRestore();
    });

    it("rejects queued concurrent requests if refresh token request fails", async () => {
      useAuthStore.setState({
        user: mockUser,
        isLoggedIn: true,
      });

      let rejectRefresh: (reason: any) => void = () => {};
      const refreshPromise = new Promise((_, reject) => {
        rejectRefresh = reject;
      });

      const postSpy = jest.spyOn(axios, "post").mockImplementationOnce(() => refreshPromise as any);

      const config1: any = {
        url: "/endpoint-1",
        headers: { set: jest.fn() },
        _retry: false,
      };

      const config2: any = {
        url: "/endpoint-2",
        headers: { set: jest.fn() },
        _retry: false,
      };

      const error1 = {
        config: config1,
        response: { status: 401 },
      };

      const error2 = {
        config: config2,
        response: { status: 401 },
      };

      const errorHandler = (api.interceptors.response as any).handlers[0].rejected;

      const req1Promise = errorHandler(error1);
      const req2Promise = errorHandler(error2);

      const refreshErr = new Error("Token revoked");
      rejectRefresh(refreshErr);

      await expect(req1Promise).rejects.toEqual(error1);
      await expect(req2Promise).rejects.toEqual(error1);

      expect(useAuthStore.getState().isLoggedIn).toBe(false);
      expect(useAuthStore.getState().user).toBeUndefined();

      postSpy.mockRestore();
    });

    it("logs out user if refresh token request fails on 401", async () => {
      useAuthStore.setState({
        user: mockUser,
        isLoggedIn: true,
      });

      const postSpy = jest.spyOn(axios, "post").mockRejectedValueOnce(new Error("Refresh expired"));

      const originalConfig: any = {
        url: "/test",
        headers: { set: jest.fn() },
        _retry: false,
      };

      const errorHandler = (api.interceptors.response as any).handlers[0].rejected;

      const error = {
        config: originalConfig,
        response: { status: 401 },
      };

      await expect(errorHandler(error)).rejects.toEqual(error);

      expect(useAuthStore.getState().isLoggedIn).toBe(false);
      expect(useAuthStore.getState().user).toBeUndefined();

      postSpy.mockRestore();
    });

    it("logs out user on 401 if user has no refreshToken", async () => {
      useAuthStore.setState({
        user: { ...mockUser, refreshToken: "" },
        isLoggedIn: true,
      });

      const originalConfig: any = {
        url: "/test",
        headers: { set: jest.fn() },
        _retry: false,
      };

      const errorHandler = (api.interceptors.response as any).handlers[0].rejected;

      const error = {
        config: originalConfig,
        response: { status: 401 },
      };

      await expect(errorHandler(error)).rejects.toEqual(error);
      expect(useAuthStore.getState().isLoggedIn).toBe(false);
      expect(useAuthStore.getState().user).toBeUndefined();
    });

    it("rejects non-401 error without refreshing token", async () => {
      const postSpy = jest.spyOn(axios, "post");
      const errorHandler = (api.interceptors.response as any).handlers[0].rejected;

      const error = {
        config: { url: "/test", headers: { set: jest.fn() } },
        response: { status: 500 },
      };

      await expect(errorHandler(error)).rejects.toEqual(error);
      expect(postSpy).not.toHaveBeenCalled();
      postSpy.mockRestore();
    });
  });
});
