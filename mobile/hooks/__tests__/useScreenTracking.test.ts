import { renderHook } from "@testing-library/react-native";
import { useScreenTracking } from "../useScreenTracking";

describe("useScreenTracking hook", () => {
  it("executes without throwing on route observation", async () => {
    await expect(
      (async () => {
        await renderHook(() => useScreenTracking());
      })(),
    ).resolves.not.toThrow();
  });
});
