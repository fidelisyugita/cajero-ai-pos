import { render, screen } from "@testing-library/react-native";
import { t } from "@/services/i18n";
import NotFoundScreen from "../+not-found";

describe("NotFoundScreen", () => {
  it("renders not found text correctly", async () => {
    await render(<NotFoundScreen />);
    expect(screen.getByText(t("not_found"))).toBeTruthy();
  });
});
