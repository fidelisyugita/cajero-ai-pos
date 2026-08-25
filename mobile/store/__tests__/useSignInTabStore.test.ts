import { useSignInTabStore } from "../useSignInTabStore";

describe("useSignInTabStore", () => {
  beforeEach(() => {
    useSignInTabStore.setState({ activeTab: 0 });
  });

  it("should initialize with tab index 0", () => {
    expect(useSignInTabStore.getState().activeTab).toBe(0);
  });

  it("should update active tab index", () => {
    useSignInTabStore.getState().setActiveTab(1);
    expect(useSignInTabStore.getState().activeTab).toBe(1);

    useSignInTabStore.getState().setActiveTab(2);
    expect(useSignInTabStore.getState().activeTab).toBe(2);
  });
});
