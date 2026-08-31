import { render, screen } from "@testing-library/react-native";
import { t } from "@/services/i18n";
import AttendanceScreen from "../index";

describe("AttendanceScreen integration", () => {
  it("renders attendance screen title", async () => {
    await render(<AttendanceScreen />);

    expect(screen.getByText(t("attendance"))).toBeTruthy();
  });
});
