import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useState } from "react";
import { Button } from "react-native";
import * as i18n from "@/services/i18n";
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

  it("skips re-rendering when parent state updates without changing props", async () => {
    const tSpy = jest.spyOn(i18n, "t");
    const Parent = () => {
      const [count, setCount] = useState(0);
      return (
        <>
          <PaymentMethods onSelect={mockOnSelect} selectedMethod="CASH" />
          <Button title={`bump-${count}`} onPress={() => setCount((c) => c + 1)} />
        </>
      );
    };

    await render(<Parent />);
    const callsAfterMount = tSpy.mock.calls.filter(([k]) => k === "select_payment_method").length;
    expect(callsAfterMount).toBe(1);

    await act(async () => {
      fireEvent.press(screen.getByText("bump-0"));
    });

    expect(screen.getByText("bump-1")).toBeTruthy();
    const callsAfterParentUpdate = tSpy.mock.calls.filter(
      ([k]) => k === "select_payment_method",
    ).length;
    expect(callsAfterParentUpdate).toBe(1);
    tSpy.mockRestore();
  });
});
