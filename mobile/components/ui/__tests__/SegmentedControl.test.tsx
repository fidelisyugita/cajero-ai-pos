import { fireEvent, render, screen } from "@testing-library/react-native";
import SegmentedControl from "../SegmentedControl";

describe("SegmentedControl component", () => {
  const options = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
  ];

  it("renders all options correctly", async () => {
    await render(<SegmentedControl onChange={jest.fn()} options={options} value="daily" />);

    expect(screen.getByText("Daily")).toBeTruthy();
    expect(screen.getByText("Weekly")).toBeTruthy();
    expect(screen.getByText("Monthly")).toBeTruthy();
  });

  it("handles selecting a different segment option", async () => {
    const handleChange = jest.fn();
    await render(<SegmentedControl onChange={handleChange} options={options} value="daily" />);

    const weeklyOption = screen.getByText("Weekly");
    fireEvent.press(weeklyOption);

    expect(handleChange).toHaveBeenCalledWith("weekly");
  });
});
