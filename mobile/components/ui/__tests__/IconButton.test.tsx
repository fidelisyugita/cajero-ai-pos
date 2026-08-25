import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { View } from "react-native";
import IconButton, { type IconButtonProps } from "../IconButton";

describe("IconButton component", () => {
  const MockIcon = jest.fn((props: { width?: number; height?: number }) => (
    <View testID="mock-icon" {...props} />
  ));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with given icon and handles onPress", async () => {
    const handlePress = jest.fn();
    await render(
      <IconButton Icon={MockIcon} onPress={handlePress} testID="icon-btn" variant="primary" />,
    );

    const button = screen.getByTestId("icon-btn");
    expect(screen.getByTestId("mock-icon")).toBeTruthy();

    await act(async () => {
      fireEvent.press(button);
    });
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it("handles pressIn and pressOut state changes", async () => {
    await render(<IconButton Icon={MockIcon} testID="icon-btn" variant="secondary" />);

    const button = screen.getByTestId("icon-btn");
    await act(async () => {
      fireEvent(button, "pressIn");
    });
    await act(async () => {
      fireEvent(button, "pressOut");
    });

    expect(screen.getByTestId("mock-icon")).toBeTruthy();
  });

  it("does not trigger onPress when disabled", async () => {
    const handlePress = jest.fn();
    await render(
      <IconButton
        disabled
        Icon={MockIcon}
        onPress={handlePress}
        testID="icon-btn"
        variant="neutral"
      />,
    );

    const button = screen.getByTestId("icon-btn");
    await act(async () => {
      fireEvent.press(button);
    });

    expect(handlePress).not.toHaveBeenCalled();
  });

  describe("variants and sizes", () => {
    const variants: IconButtonProps["variant"][] = [
      "primary",
      "secondary",
      "soft",
      "neutral",
      "neutral-no-stroke",
      "warning",
      "secondary-warning",
      "positive",
    ];
    const sizes: ("sm" | "md" | "lg")[] = ["sm", "md", "lg"];

    variants.forEach((variant) => {
      sizes.forEach((size) => {
        it(`renders variant="${variant}" with size="${size}" without crashing`, async () => {
          await render(
            <IconButton
              Icon={MockIcon}
              size={size}
              testID={`icon-btn-${variant}-${size}`}
              variant={variant}
            />,
          );
          expect(screen.getByTestId(`icon-btn-${variant}-${size}`)).toBeTruthy();
        });
      });
    });
  });
});
