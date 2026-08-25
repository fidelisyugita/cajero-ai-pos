import { useLoadingStore } from "../useLoadingStore";

describe("useLoadingStore", () => {
  beforeEach(() => {
    useLoadingStore.getState().hideLoading();
  });

  it("should initialize with isLoading false", () => {
    expect(useLoadingStore.getState().isLoading).toBe(false);
  });

  it("should set isLoading to true with showLoading", () => {
    useLoadingStore.getState().showLoading();
    expect(useLoadingStore.getState().isLoading).toBe(true);
  });

  it("should set isLoading to false with hideLoading", () => {
    useLoadingStore.getState().showLoading();
    expect(useLoadingStore.getState().isLoading).toBe(true);

    useLoadingStore.getState().hideLoading();
    expect(useLoadingStore.getState().isLoading).toBe(false);
  });
});
