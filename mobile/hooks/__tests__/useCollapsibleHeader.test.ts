import { act, renderHook } from "@testing-library/react-native";
import { useCollapsibleHeader } from "../useCollapsibleHeader";

describe("useCollapsibleHeader", () => {
  it("initializes with default values and returns expected handlers and styles", async () => {
    const { result } = await renderHook(() => useCollapsibleHeader());

    expect(result.current.scrollHandler).toBeDefined();
    expect(result.current.headerAnimatedStyle).toBeDefined();
    expect(result.current.reset).toBeDefined();
    expect(result.current.translateY.value).toBe(0);
  });

  it("handles scroll down, scroll up, and top offset transitions with nativeEvent structure", async () => {
    const { result } = await renderHook(() =>
      useCollapsibleHeader({ headerHeight: 80, scrollThreshold: 10 }),
    );

    // Initial state
    expect(result.current.translateY.value).toBe(0);

    // Scroll down by 50px (FlashList nativeEvent payload)
    await act(async () => {
      result.current.scrollHandler({
        nativeEvent: { contentOffset: { y: 50 } },
      } as any);
    });
    expect(result.current.translateY.value).toBe(-80);

    // Scroll up by 20px (from 50 to 30)
    await act(async () => {
      result.current.scrollHandler({
        nativeEvent: { contentOffset: { y: 30 } },
      } as any);
    });
    expect(result.current.translateY.value).toBe(0);

    // Scroll back to top (y <= 0)
    await act(async () => {
      result.current.scrollHandler({
        nativeEvent: { contentOffset: { y: 0 } },
      } as any);
    });
    expect(result.current.translateY.value).toBe(0);
  });

  it("handles scroll with direct contentOffset structure and resets properly", async () => {
    const { result } = await renderHook(() =>
      useCollapsibleHeader({ headerHeight: 60, scrollThreshold: 15 }),
    );

    // Scroll down with direct contentOffset
    await act(async () => {
      result.current.scrollHandler({
        contentOffset: { y: 80 },
      });
    });
    expect(result.current.translateY.value).toBe(-60);

    // Reset header
    await act(async () => {
      result.current.reset();
    });
    expect(result.current.translateY.value).toBe(0);
  });
});
