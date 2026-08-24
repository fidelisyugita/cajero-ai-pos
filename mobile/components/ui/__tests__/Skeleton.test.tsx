import { render, screen } from "@testing-library/react-native";
import Skeleton from "../Skeleton";

describe("Skeleton component", () => {
  it("renders with default props", async () => {
    await render(<Skeleton testID="skeleton-default" />);

    const skeleton = screen.getByTestId("skeleton-default");
    expect(skeleton).toBeTruthy();
  });

  it("renders with custom dimensions and borderRadius", async () => {
    await render(<Skeleton borderRadius={8} height={50} testID="skeleton-custom" width={200} />);

    const skeleton = screen.getByTestId("skeleton-custom");
    expect(skeleton).toBeTruthy();
    expect(skeleton.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          borderRadius: 8,
          height: 50,
          width: 200,
        }),
      ]),
    );
  });
});
