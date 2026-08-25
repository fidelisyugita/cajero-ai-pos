import { act, render, screen } from "@testing-library/react-native";
import { useSyncStore } from "@/store/useSyncStore";
import SyncIndicator from "../SyncIndicator";

describe("SyncIndicator component", () => {
  beforeEach(() => {
    useSyncStore.setState({ isSyncing: false });
  });

  it("renders sync text and activity indicator spinner", async () => {
    await render(<SyncIndicator />);

    expect(screen.getByText("Syncing...")).toBeTruthy();
    expect(screen.getByTestId("sync-spinner")).toBeTruthy();
    expect(screen.getByTestId("sync-indicator")).toBeTruthy();
  });

  it("handles sync state change in useSyncStore", async () => {
    await render(<SyncIndicator />);

    await act(async () => {
      useSyncStore.getState().setIsSyncing(true);
    });

    expect(screen.getByText("Syncing...")).toBeTruthy();
  });
});
