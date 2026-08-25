import { render, screen } from "@testing-library/react-native";
import Typography from "../Typography";

describe("Typography component", () => {
  it("renders text content with default props", async () => {
    await render(<Typography>Hello World</Typography>);

    expect(screen.getByText("Hello World")).toBeTruthy();
  });

  it("renders with custom color and custom style", async () => {
    await render(
      <Typography color="#ff0000" testID="custom-text">
        Colored Text
      </Typography>,
    );

    const textElement = screen.getByTestId("custom-text");
    expect(textElement).toBeTruthy();
    expect(screen.getByText("Colored Text")).toBeTruthy();
  });

  describe("variants", () => {
    const variants = [
      "display",
      "headingXl",
      "headingLg",
      "headingMd",
      "headingSm",
      "bodyXl",
      "bodyLg",
      "bodyMd",
      "bodySm",
      "caption",
      "label",
    ] as const;

    variants.forEach((variant) => {
      it(`renders variant="${variant}" without crashing`, async () => {
        await render(<Typography variant={variant}>{`Variant ${variant}`}</Typography>);
        expect(screen.getByText(`Variant ${variant}`)).toBeTruthy();
      });
    });
  });

  describe("weights and alignments", () => {
    const weights = ["regular", "medium", "bold"] as const;
    const alignments = ["left", "center", "right"] as const;

    weights.forEach((weight) => {
      it(`renders weight="${weight}" properly`, async () => {
        await render(<Typography weight={weight}>{`Weight ${weight}`}</Typography>);
        expect(screen.getByText(`Weight ${weight}`)).toBeTruthy();
      });
    });

    alignments.forEach((align) => {
      it(`renders align="${align}" properly`, async () => {
        await render(<Typography align={align}>{`Align ${align}`}</Typography>);
        expect(screen.getByText(`Align ${align}`)).toBeTruthy();
      });
    });
  });
});
