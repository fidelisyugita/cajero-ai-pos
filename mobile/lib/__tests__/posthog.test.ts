import {
  captureAnalyticsEvent,
  identifyAnalyticsUser,
  isPostHogEnabled,
  mmkvPostHogStorage,
  resetAnalyticsUser,
  trackAnalyticsScreen,
} from "../posthog";

describe("posthog lib configuration", () => {
  it("is disabled in test environment", () => {
    expect(isPostHogEnabled).toBe(false);
  });

  it("safely interacts with MMKV storage adapter", () => {
    mmkvPostHogStorage.setItem("test_key", "test_value");
    const value = mmkvPostHogStorage.getItem("test_key");
    expect(value).toBe("test_value");
  });

  it("returns null for non-existent storage keys", () => {
    const value = mmkvPostHogStorage.getItem("non_existent_key");
    expect(value).toBeNull();
  });

  it("safely executes captureAnalyticsEvent without throwing when disabled", () => {
    expect(() => {
      captureAnalyticsEvent("checkout_completed", {
        orderId: "ORD-123",
        totalAmount: 150000,
        paymentMethod: "CASH",
        itemCount: 2,
      });
    }).not.toThrow();
  });

  it("safely executes identifyAnalyticsUser without throwing when disabled", () => {
    expect(() => {
      identifyAnalyticsUser("user-1", {
        email: "cashier@cajero.local",
        name: "Cashier One",
      });
    }).not.toThrow();
  });

  it("safely executes resetAnalyticsUser without throwing when disabled", () => {
    expect(() => {
      resetAnalyticsUser();
    }).not.toThrow();
  });

  it("safely executes trackAnalyticsScreen without throwing when disabled", () => {
    expect(() => {
      trackAnalyticsScreen("dashboard", {
        path: "/(dashboard)",
      });
    }).not.toThrow();
  });
});
