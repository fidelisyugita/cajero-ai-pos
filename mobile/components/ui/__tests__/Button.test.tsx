import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Text, View } from "react-native";
import { vs } from "@/utils/Scale";
import Button, { type ButtonSize, type ButtonVariant } from "../Button";

describe("Button component", () => {
  it("renders correctly with default props and given title", async () => {
    await render(<Button title="Click Me" />);

    expect(screen.getByText("Click Me")).toBeTruthy();
  });

  it("handles onPress event when enabled", async () => {
    const handlePress = jest.fn();
    await render(<Button onPress={handlePress} title="Submit" />);

    const button = screen.getByText("Submit");
    await act(async () => {
      fireEvent.press(button);
    });

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it("does not trigger onPress when disabled", async () => {
    const handlePress = jest.fn();
    await render(<Button disabled onPress={handlePress} title="Disabled Button" />);

    const button = screen.getByText("Disabled Button");
    await act(async () => {
      fireEvent.press(button);
    });

    expect(handlePress).not.toHaveBeenCalled();
  });

  it("renders loading indicator and hides leftIcon when isLoading is true", async () => {
    const leftIconMock = jest.fn(() => <View testID="left-icon" />);
    await render(<Button isLoading leftIcon={leftIconMock} title="Loading Button" />);

    expect(screen.getByText("Loading Button")).toBeTruthy();
    expect(screen.queryByTestId("left-icon")).toBeNull();
    expect(leftIconMock).not.toHaveBeenCalled();
  });

  it("renders leftIcon when provided and not loading", async () => {
    const leftIconMock = jest.fn((size, color) => (
      <Text testID="custom-left-icon">{`Icon:${size}:${color}`}</Text>
    ));

    await render(
      <Button leftIcon={leftIconMock} size="lg" title="With Left Icon" variant="primary" />,
    );

    expect(screen.getByTestId("custom-left-icon")).toBeTruthy();
    expect(leftIconMock).toHaveBeenCalledWith(vs(24), expect.any(String));
  });

  it("renders rightIcon when provided", async () => {
    const rightIconMock = jest.fn((size, color) => (
      <Text testID="custom-right-icon">{`RightIcon:${size}:${color}`}</Text>
    ));

    await render(
      <Button rightIcon={rightIconMock} size="sm" title="With Right Icon" variant="secondary" />,
    );

    expect(screen.getByTestId("custom-right-icon")).toBeTruthy();
    expect(rightIconMock).toHaveBeenCalledWith(vs(16), expect.any(String));
  });

  it("renders custom right React node when provided", async () => {
    await render(
      <Button right={<Text testID="custom-right-node">Badge</Text>} title="With Right Node" />,
    );

    expect(screen.getByTestId("custom-right-node")).toBeTruthy();
    expect(screen.getByText("Badge")).toBeTruthy();
  });

  describe("variants and sizes", () => {
    const variants: ButtonVariant[] = [
      "primary",
      "secondary",
      "soft",
      "link",
      "neutral",
      "warning",
      "positive",
    ];
    const sizes: ButtonSize[] = ["sm", "md", "lg"];

    variants.forEach((variant) => {
      sizes.forEach((size) => {
        it(`renders variant="${variant}" with size="${size}" without crashing`, async () => {
          await render(<Button size={size} title={`${variant} ${size}`} variant={variant} />);
          expect(screen.getByText(`${variant} ${size}`)).toBeTruthy();
        });
      });
    });
  });

  it("handles press in and press out interactions", async () => {
    await render(<Button testID="press-button" title="Press States" />);

    const button = screen.getByTestId("press-button");
    fireEvent(button, "pressIn");
    fireEvent(button, "pressOut");

    expect(screen.getByText("Press States")).toBeTruthy();
  });
});
