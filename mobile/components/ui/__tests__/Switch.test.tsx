import { fireEvent, render, screen } from "@testing-library/react-native";
import Switch from "../Switch";

describe("Switch component", () => {
  it("renders correctly and handles toggling from off to on", async () => {
    const handleValueChange = jest.fn();
    await render(<Switch onValueChange={handleValueChange} testID="switch-toggle" value={false} />);

    const toggle = screen.getByTestId("switch-toggle");
    fireEvent.press(toggle);

    expect(handleValueChange).toHaveBeenCalledWith(true);
  });

  it("handles toggling from on to off", async () => {
    const handleValueChange = jest.fn();
    await render(<Switch onValueChange={handleValueChange} testID="switch-toggle" value={true} />);

    const toggle = screen.getByTestId("switch-toggle");
    fireEvent.press(toggle);

    expect(handleValueChange).toHaveBeenCalledWith(false);
  });

  it("does not trigger onValueChange when disabled", async () => {
    const handleValueChange = jest.fn();
    await render(
      <Switch disabled onValueChange={handleValueChange} testID="switch-toggle" value={false} />,
    );

    const toggle = screen.getByTestId("switch-toggle");
    fireEvent.press(toggle);

    expect(handleValueChange).not.toHaveBeenCalled();
  });
});
