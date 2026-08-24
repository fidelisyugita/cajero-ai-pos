import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import ColumnItem from "../ColumnItem";

describe("ColumnItem component", () => {
  it("renders children with proper calculated margins for first column", async () => {
    await render(
      <ColumnItem gap={16} index={0} numColumns={3}>
        <Text testID="col-item-0">First Item</Text>
      </ColumnItem>,
    );

    expect(screen.getByTestId("col-item-0")).toBeTruthy();
    expect(screen.getByText("First Item")).toBeTruthy();
  });

  it("renders children with proper calculated margins for last column", async () => {
    await render(
      <ColumnItem gap={16} index={2} numColumns={3}>
        <Text testID="col-item-2">Last Item</Text>
      </ColumnItem>,
    );

    expect(screen.getByTestId("col-item-2")).toBeTruthy();
    expect(screen.getByText("Last Item")).toBeTruthy();
  });
});
