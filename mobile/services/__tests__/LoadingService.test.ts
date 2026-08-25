import { useLoadingStore } from "../../store/useLoadingStore";
import loadingService, { LoadingService } from "../LoadingService";

describe("LoadingService", () => {
  beforeEach(() => {
    useLoadingStore.getState().hideLoading();
  });

  it("should show loading overlay by updating store state", () => {
    expect(useLoadingStore.getState().isLoading).toBe(false);

    loadingService.show();
    expect(useLoadingStore.getState().isLoading).toBe(true);
  });

  it("should hide loading overlay by updating store state", () => {
    loadingService.show();
    expect(useLoadingStore.getState().isLoading).toBe(true);

    loadingService.hide();
    expect(useLoadingStore.getState().isLoading).toBe(false);
  });

  it("should work with instantiated LoadingService class", () => {
    const customService = new LoadingService();
    customService.show();
    expect(useLoadingStore.getState().isLoading).toBe(true);

    customService.hide();
    expect(useLoadingStore.getState().isLoading).toBe(false);
  });
});
