import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useBusinessStore } from "@/store/useBusinessStore";
import { toDate } from "@/utils/Date";
import { formatCurrency } from "@/utils/Format";
import ReceiptPreviewModal from "../ReceiptPreviewModal";

describe("ReceiptPreviewModal component", () => {
  const sampleData = {
    title: "RECEIPT / STRUK",
    subtotal: "Rp 50.000",
    discount: "Rp 5.000",
    tax: "Rp 4.500",
    total: "Rp 49.500",
    paymentMethod: "CASH",
    footerMessage: "Thank you for visiting us!",
    transactionDate: toDate("2026-08-25T10:30:00Z") ?? new Date("2026-08-25T10:30:00Z"),
    transactionId: "TRX-10023",
    items: [
      {
        name: "Iced Cappuccino",
        quantity: 2,
        price: 40000,
        variants: [{ groupName: "Size", name: "Large", price: 5000 }],
      },
      {
        name: "Cheese Croissant",
        quantity: 1,
        price: "Rp 10.000",
      },
    ],
  };

  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onPrint: jest.fn(),
    data: sampleData,
    isPrinting: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useBusinessStore.setState({
      business: {
        id: "store-1",
        name: "Cajero Artisan Cafe",
        address: "123 Coffee Lane, Suite 4",
        phone: "+62 812-3456-7890",
      } as any,
    });
  });

  it("renders business info, receipt metadata, items with variants, and summary totals accurately", async () => {
    await render(<ReceiptPreviewModal {...defaultProps} />);

    expect(screen.getByText("Print Preview")).toBeTruthy();
    expect(screen.getByText("Cajero Artisan Cafe")).toBeTruthy();
    expect(screen.getByText("123 Coffee Lane, Suite 4")).toBeTruthy();
    expect(screen.getByText("+62 812-3456-7890")).toBeTruthy();
    expect(screen.getByText("RECEIPT / STRUK")).toBeTruthy();
    expect(screen.getByText("#TRX-10023")).toBeTruthy();

    // Items
    expect(screen.getByText("Iced Cappuccino")).toBeTruthy();
    expect(screen.getByText(`+ Size: Large (${formatCurrency(5000)})`)).toBeTruthy();
    expect(screen.getByText(formatCurrency(40000))).toBeTruthy();
    expect(screen.getByText("Cheese Croissant")).toBeTruthy();
    expect(screen.getByText("Rp 10.000")).toBeTruthy();

    // Totals
    expect(screen.getByText("Subtotal")).toBeTruthy();
    expect(screen.getByText("Rp 50.000")).toBeTruthy();
    expect(screen.getByText("Discount")).toBeTruthy();
    expect(screen.getByText("Rp 5.000")).toBeTruthy();
    expect(screen.getByText("Tax")).toBeTruthy();
    expect(screen.getByText("Rp 4.500")).toBeTruthy();
    expect(screen.getByText("TOTAL")).toBeTruthy();
    expect(screen.getByText("Rp 49.500")).toBeTruthy();
    expect(screen.getByText("Payment")).toBeTruthy();
    expect(screen.getByText("CASH")).toBeTruthy();
    expect(screen.getByText("Thank you for visiting us!")).toBeTruthy();
  });

  it("renders fallback values when business store or data fields are omitted", async () => {
    useBusinessStore.setState({ business: null });

    const minimalData = {
      total: "Rp 20.000",
      items: [
        {
          name: "Americano",
          quantity: 1,
          price: 20000,
        },
      ],
    };

    await render(<ReceiptPreviewModal {...defaultProps} data={minimalData} />);

    expect(screen.getByText("CAJERO POS")).toBeTruthy();
    expect(screen.getByText("No Address Provided")).toBeTruthy();
    expect(screen.getByText("-")).toBeTruthy();
    expect(screen.getByText("RECEIPT")).toBeTruthy();
    expect(screen.getByText("Thank you!")).toBeTruthy();
    expect(screen.queryByText("Payment")).toBeNull();
  });

  it("triggers onClose when 'Cancel' or top close button is pressed", async () => {
    await render(<ReceiptPreviewModal {...defaultProps} />);

    const cancelBtn = screen.getByText("Cancel");
    await act(async () => {
      fireEvent.press(cancelBtn);
    });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("triggers onPrint when 'Print' button is pressed", async () => {
    await render(<ReceiptPreviewModal {...defaultProps} />);

    const printBtn = screen.getByText("Print");
    await act(async () => {
      fireEvent.press(printBtn);
    });
    expect(defaultProps.onPrint).toHaveBeenCalledTimes(1);
  });

  it("renders printing state when isPrinting is true", async () => {
    await render(<ReceiptPreviewModal {...defaultProps} isPrinting={true} />);

    expect(screen.getByText("Printing...")).toBeTruthy();
  });
});
