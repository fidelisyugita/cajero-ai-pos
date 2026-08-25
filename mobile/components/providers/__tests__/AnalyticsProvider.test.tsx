import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { AnalyticsProvider } from "../AnalyticsProvider";

describe("AnalyticsProvider", () => {
  it("renders children cleanly in dev/test mode", async () => {
    await render(
      <AnalyticsProvider>
        <Text>Child POS Component</Text>
      </AnalyticsProvider>,
    );

    expect(screen.getByText("Child POS Component")).toBeTruthy();
  });
});
