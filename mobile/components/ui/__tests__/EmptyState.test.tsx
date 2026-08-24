import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { View } from "react-native";
import EmptyState from "../EmptyState";

describe("EmptyState component", () => {
  const MockSvg = (props: any) => <View testID="custom-empty-svg" {...props} />;

  it("renders title and default layout", async () => {
    await render(<EmptyState title="No items found" />);

    expect(screen.getByText("No items found")).toBeTruthy();
  });

  it("renders subtitle and custom image component", async () => {
    await render(
      <EmptyState
        image={MockSvg}
        subtitle="Try adding a new item to get started."
        title="Empty List"
      />,
    );

    expect(screen.getByText("Empty List")).toBeTruthy();
    expect(screen.getByText("Try adding a new item to get started.")).toBeTruthy();
    expect(screen.getByTestId("custom-empty-svg")).toBeTruthy();
  });

  it("renders action button and handles press when actionLabel and onAction are provided", async () => {
    const handleAction = jest.fn();
    await render(
      <EmptyState actionLabel="Create Item" onAction={handleAction} title="No Products" />,
    );

    expect(screen.getByText("Create Item")).toBeTruthy();

    const actionButton = screen.getByText("Create Item");
    await act(async () => {
      fireEvent.press(actionButton);
    });

    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
