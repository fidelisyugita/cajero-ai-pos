import { render, screen } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import ReceiptDetailScreen from "../detail";

jest.mock("@/services/PrinterService", () => ({
  printerService: {
    printReceipt: jest.fn(),
  },
}));

describe("ReceiptDetailScreen integration", () => {
  const sampleTransaction = {
    id: "tx-100",
    invoiceNumber: "INV-2026-001",
    subtotal: 50000,
    grandTotal: 55000,
    tax: 5000,
    discount: 0,
    status: "PAID",
    paymentMethod: "CASH",
    paymentAmount: 60000,
    changeAmount: 5000,
    customerName: "Alice Customer",
    cashierName: "Bob Cashier",
    createdAt: "2026-03-01T10:00:00.000Z",
    transactionProduct: [
      {
        id: "tp-1",
        productName: "Cappuccino",
        quantity: 2,
        price: 25000,
        subtotal: 50000,
        selectedVariants: [],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      transaction: JSON.stringify(sampleTransaction),
    });
  });

  it("renders transaction breakdown, items, and print button", async () => {
    await render(<ReceiptDetailScreen />);

    expect(screen.getByText("Receipt Details")).toBeTruthy();
    expect(screen.getByText(/tx-100/i)).toBeTruthy();
    expect(screen.getByText(/Cappuccino/i)).toBeTruthy();
    expect(screen.getByText("Print Receipt")).toBeTruthy();
  });

  it("renders not found state when transaction param is missing", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({});

    await render(<ReceiptDetailScreen />);

    expect(screen.getByText("Transaction not found")).toBeTruthy();
  });
});
