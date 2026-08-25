import { act, render, screen } from "@testing-library/react-native";
import { useLoadingStore } from "@/store/useLoadingStore";
import LoadingOverlay from "../LoadingOverlay";

describe("LoadingOverlay component", () => {
  beforeEach(() => {
    useLoadingStore.setState({ isLoading: false });
  });

  it("renders hidden by default when isLoading is false", async () => {
    await render(<LoadingOverlay />);

    expect(screen.queryByTestId("loading-indicator")).toBeNull();
  });

  it("becomes visible and renders ActivityIndicator when showLoading is called", async () => {
    await render(<LoadingOverlay />);

    await act(async () => {
      useLoadingStore.getState().showLoading();
    });

    expect(await screen.findByTestId("loading-indicator")).toBeTruthy();
  });

  it("hides when hideLoading is called", async () => {
    useLoadingStore.setState({ isLoading: true });
    await render(<LoadingOverlay />);

    expect(await screen.findByTestId("loading-indicator")).toBeTruthy();

    await act(async () => {
      useLoadingStore.getState().hideLoading();
    });

    expect(screen.queryByTestId("loading-indicator")).toBeNull();
  });
});
