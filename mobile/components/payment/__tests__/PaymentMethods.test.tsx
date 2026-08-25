import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useReferenceStore } from "@/store/useReferenceStore";
import PaymentMethods from "../PaymentMethods";

describe("PaymentMethods component", () => {
  const mockOnSelect = jest.fn();
  const sampleMethods = [
    { code: "CASH", name: "Cash" },
    { code: "QRIS", name: "QRIS" },
    { code: "DEBIT", name: "Debit Card" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useReferenceStore.setState({
      paymentMethods: sampleMethods as any,
    });
  });

  it("renders title and list of payment methods correctly", async () => {
    await render(<PaymentMethods onSelect={mockOnSelect} selectedMethod="CASH" />);

    expect(screen.getByText("Select Payment Method")).toBeTruthy();
    expect(screen.getByText("Cash")).toBeTruthy();
    expect(screen.getByText("QRIS")).toBeTruthy();
    expect(screen.getByText("Debit Card")).toBeTruthy();
  });

  it("handles payment method selection on click", async () => {
    await render(<PaymentMethods onSelect={mockOnSelect} selectedMethod="CASH" />);

    await act(async () => {
      fireEvent.press(screen.getByText("QRIS"));
    });

    expect(mockOnSelect).toHaveBeenCalledWith("QRIS");
  });

  it("renders empty list gracefully when no payment methods exist in store", async () => {
    useReferenceStore.setState({ paymentMethods: [] });
    await render(<PaymentMethods onSelect={mockOnSelect} selectedMethod="" />);

    expect(screen.getByText("Select Payment Method")).toBeTruthy();
    expect(screen.queryByText("Cash")).toBeNull();
  });
});
