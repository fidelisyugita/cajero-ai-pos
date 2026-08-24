import { useAuthStore } from "../useAuthStore";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      isLoggedIn: false,
      user: undefined,
    });
  });

  it("should initialize with default state", () => {
    const state = useAuthStore.getState();
    expect(state.isLoggedIn).toBe(false);
    expect(state.user).toBeUndefined();
  });

  it("should update isLoggedIn flag", () => {
    useAuthStore.getState().setLoggedIn(true);
    expect(useAuthStore.getState().isLoggedIn).toBe(true);

    useAuthStore.getState().setLoggedIn(false);
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });

  it("should update user profile", () => {
    const mockUser = {
      id: "usr-123",
      name: "Admin Cashier",
      email: "admin@cajero.app",
      phone: "+628123456789",
      storeId: "store-456",
      roleCode: "CASHIER",
      imageUrl: "https://example.com/avatar.jpg",
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-02T00:00:00Z",
    };

    useAuthStore.getState().setUser(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  it("should clear user profile on logout", () => {
    const mockUser = {
      id: "usr-123",
      name: "Admin Cashier",
      email: "admin@cajero.app",
      phone: null,
      storeId: "store-456",
      roleCode: "CASHIER",
      imageUrl: null,
      accessToken: "token",
      refreshToken: "refresh",
      createdAt: null,
      updatedAt: null,
    };

    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setLoggedIn(true);

    expect(useAuthStore.getState().user).toBeDefined();
    expect(useAuthStore.getState().isLoggedIn).toBe(true);

    useAuthStore.getState().setUser(undefined);
    useAuthStore.getState().setLoggedIn(false);

    expect(useAuthStore.getState().user).toBeUndefined();
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });
});
