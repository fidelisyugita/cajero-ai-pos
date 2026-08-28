import { render } from "@testing-library/react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "../_layout";

jest.mock("@/components/dashboard/Sidebar", () => {
  const { View } = require("react-native");
  return () => <View testID="mock-sidebar" />;
});

jest.mock("@/components/ui/SyncIndicator", () => {
  const { View } = require("react-native");
  return () => <View testID="mock-sync-indicator" />;
});

describe("DashboardLayout", () => {
  it("redirects to /(auth)/sign-in when not logged in", async () => {
    useAuthStore.setState({ isLoggedIn: false });
    await render(<DashboardLayout />);
    expect(Redirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(auth)/sign-in" }),
      undefined,
    );
  });

  it("renders sidebar and content when logged in", async () => {
    useAuthStore.setState({ isLoggedIn: true });
    const { getByTestId } = await render(<DashboardLayout />);
    expect(getByTestId("mock-sidebar")).toBeTruthy();
    expect(getByTestId("mock-sync-indicator")).toBeTruthy();
  });
});
