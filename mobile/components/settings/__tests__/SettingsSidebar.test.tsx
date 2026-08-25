import { fireEvent, render, screen } from "@testing-library/react-native";
import SettingsSidebar from "../SettingsSidebar";

describe("SettingsSidebar component", () => {
  it("renders menu items and triggers onTabChange", async () => {
    const mockOnTabChange = jest.fn();
    await render(<SettingsSidebar activeTab="printers" onTabChange={mockOnTabChange} />);

    expect(screen.getByText("Printers")).toBeTruthy();
    expect(screen.getByText("Language")).toBeTruthy();
    expect(screen.getByText("Developer")).toBeTruthy();
    expect(screen.getByText("Help and Support")).toBeTruthy();

    const langTab = screen.getByText("Language");
    fireEvent.press(langTab);

    expect(mockOnTabChange).toHaveBeenCalledWith("language");
  });
});
