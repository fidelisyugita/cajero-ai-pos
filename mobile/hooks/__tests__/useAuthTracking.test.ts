import { renderHook } from "@testing-library/react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuthTracking } from "../useAuthTracking";

describe("useAuthTracking hook", () => {
  beforeEach(() => {
    useAuthStore.setState({
      isLoggedIn: false,
      user: undefined,
    });
  });

  it("runs cleanly on initial render when not logged in", async () => {
    await expect(
      (async () => {
        await renderHook(() => useAuthTracking());
      })(),
    ).resolves.not.toThrow();
  });

  it("handles logged in user state cleanly", async () => {
    useAuthStore.setState({
      isLoggedIn: true,
      user: {
        id: "user-test-id",
        name: "Jane Cashier",
        email: "cashier@cajero.local",
        phone: "1234567890",
        storeId: "store-1",
        roleCode: "CASHIER",
        imageUrl: null,
        accessToken: "mock-token",
        refreshToken: "mock-refresh",
        createdAt: null,
        updatedAt: null,
      },
    });

    await expect(
      (async () => {
        await renderHook(() => useAuthTracking());
      })(),
    ).resolves.not.toThrow();
  });
});
