import { render, screen } from "@testing-library/react-native";
import NotFoundScreen from "../+not-found";

describe("NotFoundScreen", () => {
  it("renders not found text correctly", async () => {
    await render(<NotFoundScreen />);
    expect(screen.getByText("not found")).toBeTruthy();
  });
});
