import { render } from "@testing-library/react-native";
import { Redirect } from "expo-router";
import DashboardScreen from "../index";

describe("DashboardScreen", () => {
  it("redirects to /(dashboard)/menu", async () => {
    await render(<DashboardScreen />);
    expect(Redirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(dashboard)/menu" }),
      undefined,
    );
  });
});
