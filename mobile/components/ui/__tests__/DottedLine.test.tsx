import { render, screen } from "@testing-library/react-native";
import DottedLine from "../DottedLine";

describe("DottedLine component", () => {
  it("renders horizontal dotted line by default", async () => {
    await render(<DottedLine testID="default-dotted-line" />);

    expect(screen.getByTestId("default-dotted-line")).toBeTruthy();
  });

  it("renders vertical dotted line with custom color and thickness", async () => {
    await render(
      <DottedLine
        color="#ff0000"
        length={150}
        orientation="vertical"
        testID="custom-dotted-line"
        thickness={4}
      />,
    );

    expect(screen.getByTestId("custom-dotted-line")).toBeTruthy();
  });
});
