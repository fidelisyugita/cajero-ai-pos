import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import Skeleton, { SkeletonGroup } from "../Skeleton";

describe("Skeleton component", () => {
  it("renders with default props", async () => {
    await render(<Skeleton testID="skeleton-default" />);

    const skeleton = screen.getByTestId("skeleton-default");
    expect(skeleton).toBeTruthy();
    expect(StyleSheet.flatten(skeleton.props.style)).toHaveProperty("opacity");
  });

  it("renders with custom dimensions and borderRadius", async () => {
    await render(<Skeleton borderRadius={8} height={50} testID="skeleton-custom" width={200} />);

    const skeleton = screen.getByTestId("skeleton-custom");
    expect(skeleton).toBeTruthy();
    expect(StyleSheet.flatten(skeleton.props.style)).toEqual(
      expect.objectContaining({
        borderRadius: 8,
        height: 50,
        width: 200,
      }),
    );
  });

  it("renders plain View cells inside SkeletonGroup with a single animated container", async () => {
    await render(
      <SkeletonGroup testID="skeleton-group">
        <Skeleton testID="grouped-cell-1" width={120} height={16} borderRadius={6} />
        <Skeleton testID="grouped-cell-2" />
      </SkeletonGroup>,
    );

    const group = screen.getByTestId("skeleton-group");
    const cell1 = screen.getByTestId("grouped-cell-1");
    const cell2 = screen.getByTestId("grouped-cell-2");

    expect(StyleSheet.flatten(group.props.style)).toHaveProperty("opacity");
    expect(cell1.type).toBe("View");
    expect(cell2.type).toBe("View");
    expect(StyleSheet.flatten(cell1.props.style)).not.toHaveProperty("opacity");
    expect(StyleSheet.flatten(cell1.props.style)).toEqual(
      expect.objectContaining({
        borderRadius: 6,
        height: 16,
        width: 120,
      }),
    );
    expect(StyleSheet.flatten(cell2.props.style)).toEqual(
      expect.objectContaining({
        borderRadius: 4,
        height: 20,
        width: "100%",
      }),
    );
  });
});
