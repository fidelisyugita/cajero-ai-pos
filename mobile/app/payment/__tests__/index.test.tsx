import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { t } from "@/services/i18n";
import { useCreateTransactionMutation } from "@/services/mutations/useCreateTransactionMutation";
import { printerService } from "@/services/PrinterService";
import { usePrinterStore } from "@/store/PrinterStore";
import { useDraftStore } from "@/store/useDraftStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useReferenceStore } from "@/store/useReferenceStore";
import { formatCurrency } from "@/utils/Format";
import PaymentScreen from "../index";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/services/mutations/useCreateTransactionMutation", () => ({
  useCreateTransactionMutation: jest.fn(),
}));

jest.mock("@/services/PrinterService", () => ({
  printerService: {
    printReceipt: jest.fn(),
  },
}));

describe("PaymentScreen", () => {
  const mockReplace = jest.fn();
  let mockCreateTransaction: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });

    mockCreateTransaction = jest.fn();
    (useCreateTransactionMutation as jest.Mock).mockReturnValue({
      mutate: mockCreateTransaction,
      isPending: false,
    });

    (printerService.printReceipt as jest.Mock).mockResolvedValue(undefined);
    jest.spyOn(Alert, "alert").mockImplementation(() => {});

    // Seed reference store with payment methods and transaction types
    useReferenceStore.setState({
      paymentMethods: [
        { code: "CASH", name: "Cash" },
        { code: "QRIS", name: "QRIS" },
        { code: "TRANSFER", name: "Bank Transfer" },
      ],
      transactionTypes: [
        { code: "DINE_IN", name: "Dine In" },
        { code: "TAKE_AWAY", name: "Take Away" },
      ],
    });

    // Seed order store
    useOrderStore.setState({
      items: [
        {
          id: "item-1",
          productId: "prod-1",
          name: "Caramel Latte",
          sellingPrice: 30000,
          quantity: 2,
          variants: [
            { groupId: "g-1", groupName: "Size", optionId: "opt-1", name: "Large", price: 5000 },
          ],
          note: "Extra hot",
          discount: 2000,
          tax: 1000,
          commission: 500,
        },
      ],
      customerName: "Alice",
      tableNumber: "T-05",
      discount: 5000,
    });

    // Reset printer store
    usePrinterStore.setState({
      isAutoPrintEnabled: false,
      isConnected: false,
      connectedDevice: null,
    });

    // Reset draft store
    useDraftStore.setState({
      drafts: [],
    });
  });

  it("renders transaction header, payment methods, draft buttons, and CashPayment", async () => {
    await render(<PaymentScreen />);

    expect(screen.getByText(t("transaction"))).toBeTruthy();
    expect(screen.getByText("Cash")).toBeTruthy();
    expect(screen.getByText("QRIS")).toBeTruthy();
    expect(screen.getByText("Bank Transfer")).toBeTruthy();
    expect(screen.getByText(t("print_bill"))).toBeTruthy();
    expect(screen.getByText(t("draft_open_bill"))).toBeTruthy();
  });

  it("switches payment method when pressing another method card", async () => {
    await render(<PaymentScreen />);

    const qrisMethod = screen.getByText("QRIS");
    await act(async () => {
      fireEvent.press(qrisMethod);
    });

    // Re-press Cash to switch back
    const cashMethod = screen.getByText("Cash");
    await act(async () => {
      fireEvent.press(cashMethod);
    });
  });

  it("completes cash payment flow and displays SuccessView upon transaction creation", async () => {
    // Total calculation:
    // subtotal = (30000 + 5000) * 2 = 70000
    // item discounts = 2000
    // total tax = 1000 * 2 = 2000
    // finalSubtotal = 70000 - 2000 = 68000
    // total = 68000 - 5000 (global discount) + 2000 (tax) = 65000

    mockCreateTransaction.mockImplementation((_payload, options) => {
      options.onSuccess({ id: "TRX-9988" });
    });

    await render(<PaymentScreen />);

    // Click Exact amount suggestion in CashPayment (65000)
    const exactBtn = screen.getByText("Exact");
    await act(async () => {
      fireEvent.press(exactBtn);
    });

    // Pay button
    const payBtn = screen.getByText("Pay");
    await act(async () => {
      fireEvent.press(payBtn);
    });

    expect(mockCreateTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        totalPrice: 65000,
        paymentMethodCode: "CASH",
        statusCode: "COMPLETED",
        description: "Name: Alice, Table: T-05",
        transactionProducts: [
          expect.objectContaining({
            productId: "prod-1",
            quantity: 2,
            sellingPrice: 30000,
          }),
        ],
      }),
      expect.any(Object),
    );

    // Transitions to SuccessView
    expect(screen.getByText("Payment Success!")).toBeTruthy();
    expect(screen.getByText("Transaction No. TRX-9988")).toBeTruthy();
    expect(screen.getAllByText(formatCurrency(65000)).length).toBeGreaterThanOrEqual(1);
  });

  it("triggers auto-print on successful payment if auto-print is enabled", async () => {
    usePrinterStore.setState({
      isAutoPrintEnabled: true,
      isConnected: true,
      connectedDevice: { id: "bt-printer-1", name: "POS-58" } as any,
    });

    mockCreateTransaction.mockImplementation((_payload, options) => {
      options.onSuccess({ id: "TRX-1001" });
    });

    await render(<PaymentScreen />);

    // Pay exact amount
    await act(async () => {
      fireEvent.press(screen.getByText("Exact"));
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Pay"));
    });

    expect(printerService.printReceipt).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "RECEIPT / STRUK",
        transactionId: "TRX-1001",
        total: formatCurrency(65000),
      }),
    );
  });

  it("handles payment transaction error gracefully with alert", async () => {
    mockCreateTransaction.mockImplementation((_payload, options) => {
      options.onError(new Error("Database transaction failed"));
    });

    await render(<PaymentScreen />);

    await act(async () => {
      fireEvent.press(screen.getByText("Exact"));
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Pay"));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Payment Failed",
      "An error occurred while processing the transaction.",
    );
    expect(screen.queryByText("Payment Success!")).toBeNull();
  });

  it("saves order as draft when pressing Draft / Open Bill button", async () => {
    await render(<PaymentScreen />);

    const draftButton = screen.getByText(t("draft_open_bill"));
    await act(async () => {
      fireEvent.press(draftButton);
    });

    expect(useDraftStore.getState().drafts).toHaveLength(1);
    expect(useDraftStore.getState().drafts[0].customerName).toBe("Alice");
    expect(Alert.alert).toHaveBeenCalledWith(
      "Draft Bill",
      "Bill saved as draft. Ready for next customer.",
    );
    expect(useOrderStore.getState().items).toHaveLength(0);
    expect(mockReplace).toHaveBeenCalledWith("/(dashboard)/menu");
  });

  it("opens ReceiptPreviewModal when pressing Print Bill and allows printing", async () => {
    await render(<PaymentScreen />);

    const printBillBtn = screen.getByText(t("print_bill"));
    await act(async () => {
      fireEvent.press(printBillBtn);
    });

    // Preview modal opens
    expect(screen.getByText(t("print_preview"))).toBeTruthy();

    // Click Print button inside preview modal
    const printModalBtn = screen.getByText(t("print"));
    await act(async () => {
      fireEvent.press(printModalBtn);
    });

    await waitFor(() => {
      expect(printerService.printReceipt).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "BILL / TAGIHAN",
          total: formatCurrency(65000),
        }),
      );
    });
  });

  it("navigates to menu and resets order on New Order from SuccessView", async () => {
    mockCreateTransaction.mockImplementation((_payload, options) => {
      options.onSuccess({ id: "TRX-777" });
    });

    await render(<PaymentScreen />);

    await act(async () => {
      fireEvent.press(screen.getByText("Exact"));
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Pay"));
    });

    expect(screen.getByText("Payment Success!")).toBeTruthy();

    const newOrderBtn = screen.getByText("New Order");
    await act(async () => {
      fireEvent.press(newOrderBtn);
    });

    expect(useOrderStore.getState().items).toHaveLength(0);
    expect(mockReplace).toHaveBeenCalledWith("/(dashboard)/menu");
  });
});
