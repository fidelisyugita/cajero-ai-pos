import { renderHook } from "@testing-library/react-native";
import { useAnalytics } from "../useAnalytics";

describe("useAnalytics hook", () => {
  it("returns analytics helper methods and enabled status", async () => {
    const { result } = await renderHook(() => useAnalytics());

    expect(typeof result.current.trackEvent).toBe("function");
    expect(typeof result.current.identify).toBe("function");
    expect(typeof result.current.reset).toBe("function");
    expect(typeof result.current.trackScreen).toBe("function");
    expect(result.current.isEnabled).toBe(false);
  });

  it("executes trackEvent without throwing", async () => {
    const { result } = await renderHook(() => useAnalytics());

    expect(() => {
      result.current.trackEvent("cart_item_added", {
        productId: "prod-1",
        productName: "Cappuccino",
        price: 35000,
        quantity: 1,
      });
    }).not.toThrow();
  });

  it("executes identify and reset without throwing", async () => {
    const { result } = await renderHook(() => useAnalytics());

    expect(() => {
      result.current.identify("user-123", { name: "John Doe" });
    }).not.toThrow();

    expect(() => {
      result.current.reset();
    }).not.toThrow();
  });
});
