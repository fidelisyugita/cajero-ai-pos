import { fireEvent, render, screen } from "@testing-library/react-native";
import Checkbox from "../Checkbox";

describe("Checkbox component", () => {
  it("renders unchecked by default with proper accessibility attributes", async () => {
    await render(<Checkbox onPress={jest.fn()} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeTruthy();
    expect(checkbox.props.accessibilityState.checked).toBe(false);
  });

  it("renders checked state correctly", async () => {
    await render(<Checkbox checked onPress={jest.fn()} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.props.accessibilityState.checked).toBe(true);
  });

  it("handles onPress event when enabled", async () => {
    const handlePress = jest.fn();
    await render(<Checkbox onPress={handlePress} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.press(checkbox);

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it("does not trigger onPress when disabled", async () => {
    const handlePress = jest.fn();
    await render(<Checkbox disabled onPress={handlePress} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(checkbox);
    expect(handlePress).not.toHaveBeenCalled();
  });
});
