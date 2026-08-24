import { fireEvent, render, screen } from "@testing-library/react-native";
import RadioButton from "../RadioButton";

describe("RadioButton component", () => {
  it("renders with correct accessibility role and unchecked state", async () => {
    await render(<RadioButton checked={false} onPress={jest.fn()} />);

    const radio = screen.getByRole("radio");
    expect(radio).toBeTruthy();
    expect(radio.props.accessibilityState.checked).toBe(false);
  });

  it("renders checked state correctly", async () => {
    await render(<RadioButton checked={true} onPress={jest.fn()} />);

    const radio = screen.getByRole("radio");
    expect(radio.props.accessibilityState.checked).toBe(true);
  });

  it("handles onPress event when enabled", async () => {
    const handlePress = jest.fn();
    await render(<RadioButton checked={false} onPress={handlePress} />);

    const radio = screen.getByRole("radio");
    fireEvent.press(radio);

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it("does not trigger onPress when disabled", async () => {
    const handlePress = jest.fn();
    await render(<RadioButton checked={false} disabled onPress={handlePress} />);

    const radio = screen.getByRole("radio");
    expect(radio.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(radio);
    expect(handlePress).not.toHaveBeenCalled();
  });
});
