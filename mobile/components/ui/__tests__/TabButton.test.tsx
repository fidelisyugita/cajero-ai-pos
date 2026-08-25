import { fireEvent, render, screen } from "@testing-library/react-native";
import TabButton from "../TabButton";

describe("TabButton component", () => {
  it("renders tab title in inactive state", async () => {
    await render(<TabButton isActive={false} onPress={jest.fn()} title="Orders" />);

    expect(screen.getByText("Orders")).toBeTruthy();
  });

  it("renders tab title in active state", async () => {
    await render(<TabButton isActive={true} onPress={jest.fn()} title="Transactions" />);

    expect(screen.getByText("Transactions")).toBeTruthy();
  });

  it("handles onPress event", async () => {
    const handlePress = jest.fn();
    await render(<TabButton isActive={false} onPress={handlePress} title="Settings" />);

    const tab = screen.getByText("Settings");
    fireEvent.press(tab);

    expect(handlePress).toHaveBeenCalledTimes(1);
  });
});
