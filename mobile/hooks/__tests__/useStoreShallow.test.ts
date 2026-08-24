import { act, renderHook } from "@testing-library/react-native";
import { create } from "zustand";
import { useStoreShallow } from "../useStoreShallow";

interface TestState {
  count: number;
  name: string;
  tags: string[];
  increment: () => void;
  setName: (name: string) => void;
  setTags: (tags: string[]) => void;
}

const useTestStore = create<TestState>((set) => ({
  count: 0,
  name: "cajero",
  tags: ["pos", "ai"],
  increment: () => set((state) => ({ count: state.count + 1 })),
  setName: (name) => set({ name }),
  setTags: (tags) => set({ tags }),
}));

describe("useStoreShallow", () => {
  beforeEach(() => {
    useTestStore.setState({
      count: 0,
      name: "cajero",
      tags: ["pos", "ai"],
    });
  });

  it("selects specific state slices correctly", async () => {
    const { result } = await renderHook(() =>
      useStoreShallow(useTestStore, (state) => ({
        count: state.count,
        name: state.name,
      })),
    );

    expect(result.current).toEqual({
      count: 0,
      name: "cajero",
    });
  });

  it("updates when selected state changes", async () => {
    const { result } = await renderHook(() =>
      useStoreShallow(useTestStore, (state) => ({
        count: state.count,
        name: state.name,
      })),
    );

    await act(async () => {
      useTestStore.getState().increment();
    });

    expect(result.current.count).toBe(1);
  });

  it("does not re-render when unselected state changes with shallow equality", async () => {
    let renderCount = 0;
    const { result } = await renderHook(() => {
      renderCount++;
      return useStoreShallow(useTestStore, (state) => ({
        name: state.name,
      }));
    });

    expect(renderCount).toBe(1);
    expect(result.current.name).toBe("cajero");

    // Changing count (unselected field) should not trigger re-render
    await act(async () => {
      useTestStore.getState().increment();
    });

    expect(renderCount).toBe(1);

    // Changing tags (unselected field) should not trigger re-render
    await act(async () => {
      useTestStore.getState().setTags(["new", "tags"]);
    });

    expect(renderCount).toBe(1);

    // Changing name (selected field) should trigger re-render
    await act(async () => {
      useTestStore.getState().setName("new cajero");
    });

    expect(renderCount).toBe(2);
    expect(result.current.name).toBe("new cajero");
  });
});
