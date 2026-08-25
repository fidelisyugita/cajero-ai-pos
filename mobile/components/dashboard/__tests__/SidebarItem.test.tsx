import { fireEvent, render, screen } from "@testing-library/react-native";
import { View } from "react-native";
import SidebarItem from "../SidebarItem";

const MockIconInactive = () => <View testID="icon-inactive" />;
const MockIconActive = () => <View testID="icon-active" />;

describe("SidebarItem component", () => {
  it("renders inactive state and triggers onPress when clicked", async () => {
    const mockOnPress = jest.fn();
    await render(
      <SidebarItem
        Icons={[MockIconInactive as any, MockIconActive as any]}
        isActive={false}
        label="Menu"
        onPress={mockOnPress}
      />,
    );

    expect(screen.getByText("Menu")).toBeTruthy();
    expect(screen.getByTestId("icon-inactive")).toBeTruthy();

    const btn = screen.getByText("Menu");
    fireEvent.press(btn);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("renders active state and shows active icon", async () => {
    const mockOnPress = jest.fn();
    await render(
      <SidebarItem
        Icons={[MockIconInactive as any, MockIconActive as any]}
        isActive={true}
        label="Stock"
        onPress={mockOnPress}
      />,
    );

    expect(screen.getByText("Stock")).toBeTruthy();
    expect(screen.getByTestId("icon-active")).toBeTruthy();
  });
});
