import { render } from "@testing-library/react-native";
import MenuListSkeleton from "../MenuListSkeleton";

describe("MenuListSkeleton component", () => {
  it("renders correctly without throwing", async () => {
    const { toJSON } = await render(<MenuListSkeleton />);
    expect(toJSON()).toBeTruthy();
  });
});
