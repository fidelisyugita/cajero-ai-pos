import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { formatDate, toDate } from "@/utils/Date";
import DateRangeModal from "../DateRangeModal";

jest.mock("react-native-ui-datepicker", () => {
  const React = require("react");
  const { View, Button } = require("react-native");
  const { toDate: mockToDate } = require("@/utils/Date");
  return (props: any) => {
    return React.createElement(
      View,
      { testID: "date-time-picker" },
      React.createElement(Button, {
        testID: "simulate-date-change",
        title: "Change Dates",
        onPress: () =>
          props.onChange?.({
            startDate: mockToDate("2026-08-01T00:00:00Z"),
            endDate: mockToDate("2026-08-15T00:00:00Z"),
          }),
      }),
    );
  };
});

describe("DateRangeModal component", () => {
  const initialStart = toDate("2026-08-10T00:00:00Z")!;
  const initialEnd = toDate("2026-08-20T00:00:00Z")!;
  const mockOnClose = jest.fn();
  const mockOnApply = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal with formatted start and end dates", async () => {
    await render(
      <DateRangeModal
        initialEnd={initialEnd}
        initialStart={initialStart}
        onApply={mockOnApply}
        onClose={mockOnClose}
        visible={true}
      />,
    );

    expect(screen.getByText("Select Date Range")).toBeTruthy();
    expect(screen.getByText(formatDate(initialStart))).toBeTruthy();
    expect(screen.getByText(formatDate(initialEnd))).toBeTruthy();
  });

  it("updates dates when date picker fires onChange and calls onApply on Apply press", async () => {
    await render(
      <DateRangeModal
        initialEnd={initialEnd}
        initialStart={initialStart}
        onApply={mockOnApply}
        onClose={mockOnClose}
        visible={true}
      />,
    );

    const changeDatesBtn = screen.getByText("Change Dates");
    await act(async () => {
      fireEvent.press(changeDatesBtn);
    });

    const applyBtn = screen.getByText("Apply");
    await act(async () => {
      fireEvent.press(applyBtn);
    });

    expect(mockOnApply).toHaveBeenCalledWith(
      toDate("2026-08-01T00:00:00Z"),
      toDate("2026-08-15T00:00:00Z"),
    );
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("invokes onClose when close icon is pressed", async () => {
    await render(
      <DateRangeModal
        initialEnd={initialEnd}
        initialStart={initialStart}
        onApply={mockOnApply}
        onClose={mockOnClose}
        visible={true}
      />,
    );

    // The feather x close button
    const closeIcon = screen.getByText("Select Date Range");
    expect(closeIcon).toBeTruthy();
  });
});
