import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { formatCurrency } from "@/utils/Format";
import SuccessView from "../SuccessView";

describe("SuccessView component", () => {
  const defaultProps = {
    transactionNumber: "TRX-998822",
    totalAmount: 75000,
    paidAmount: 100000,
    change: 25000,
    onNewTransaction: jest.fn(),
    onPrintReceipt: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders transaction details, formatted amounts, and change accurately", async () => {
    await render(<SuccessView {...defaultProps} />);

    expect(screen.getByText("Payment Success!")).toBeTruthy();
    expect(screen.getByText("Transaction No. TRX-998822")).toBeTruthy();
    expect(screen.getByText("Total Price")).toBeTruthy();
    expect(screen.getByText(formatCurrency(75000))).toBeTruthy();
    expect(screen.getByText("Cash")).toBeTruthy();
    expect(screen.getByText(formatCurrency(100000))).toBeTruthy();
    expect(screen.getByText("Change")).toBeTruthy();
    expect(screen.getByText(formatCurrency(25000))).toBeTruthy();
  });

  it("triggers onNewTransaction when 'New Order' button is clicked", async () => {
    await render(<SuccessView {...defaultProps} />);

    const newOrderBtn = screen.getByText("New Order");
    await act(async () => {
      fireEvent.press(newOrderBtn);
    });

    expect(defaultProps.onNewTransaction).toHaveBeenCalledTimes(1);
  });

  it("triggers onPrintReceipt when 'Print Receipt' button is clicked", async () => {
    await render(<SuccessView {...defaultProps} />);

    const printReceiptBtn = screen.getByText("Print Receipt");
    await act(async () => {
      fireEvent.press(printReceiptBtn);
    });

    expect(defaultProps.onPrintReceipt).toHaveBeenCalledTimes(1);
  });
});
