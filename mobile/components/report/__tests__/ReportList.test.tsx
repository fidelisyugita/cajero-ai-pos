import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { mockRouter } from "@/jest.setup";
import type { DailyReport } from "@/services/types/Report";
import { formatCurrency } from "@/utils/Format";
import ReportList from "../ReportList";

describe("ReportList component", () => {
  const sampleReports: DailyReport[] = [
    {
      date: "2026-08-25",
      totalTransaction: 45,
      totalProductSold: 80,
      totalRevenue: 2500000,
      totalDiscount: 100000,
      totalTax: 250000,
      totalExpenses: 300000,
      totalCogs: 800000,
      totalRefund: 50000,
      totalRefundTransaction: 1,
      totalRefundProduct: 2,
      totalNetRevenue: 2450000,
      paymentMethods: [
        { paymentMethod: "CASH", totalAmount: 1500000 },
        { paymentMethod: "QRIS", totalAmount: 1000000 },
      ],
      commissions: [],
    },
    {
      date: "2026-08-24",
      totalTransaction: 30,
      totalProductSold: 50,
      totalRevenue: 1500000,
      totalDiscount: 50000,
      totalTax: 150000,
      totalExpenses: 200000,
      totalCogs: 500000,
      totalRefund: 0,
      totalRefundTransaction: 0,
      totalRefundProduct: 0,
      totalNetRevenue: 1500000,
      paymentMethods: [{ paymentMethod: "CASH", totalAmount: 1500000 }],
      commissions: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders table headers and daily report rows with formatted financial values", async () => {
    await render(<ReportList data={sampleReports} isLoading={false} />);

    expect(screen.getByText("Date")).toBeTruthy();
    expect(screen.getByText("Transaction")).toBeTruthy();
    expect(screen.getByText("Item Sales")).toBeTruthy();
    expect(screen.getByText("Revenue")).toBeTruthy();
    expect(screen.getByText("Refund")).toBeTruthy();
    expect(screen.getByText("Net Revenue")).toBeTruthy();

    expect(screen.getByText("25 Aug 2026")).toBeTruthy();
    expect(screen.getByText("45")).toBeTruthy();
    expect(screen.getByText("80")).toBeTruthy();
    expect(screen.getByText(formatCurrency(2500000))).toBeTruthy();
    expect(screen.getByText(formatCurrency(50000))).toBeTruthy();
    expect(screen.getByText(formatCurrency(2450000))).toBeTruthy();

    expect(screen.getByText("24 Aug 2026")).toBeTruthy();
  });

  it("renders skeleton loader when isLoading is true", async () => {
    await render(<ReportList data={[]} isLoading={true} />);

    expect(screen.queryByText("25 Aug 2026")).toBeNull();
  });

  it("renders EmptyState when reports data is empty", async () => {
    await render(<ReportList data={[]} isLoading={false} />);

    expect(screen.getByText("No Reports Found")).toBeTruthy();
  });

  it("navigates to report detail screen when Detail button is pressed", async () => {
    await render(<ReportList data={sampleReports} isLoading={false} />);

    const detailButtons = screen.getAllByText("Detail");
    await act(async () => {
      fireEvent.press(detailButtons[0]);
    });

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/report/detail",
      params: { report: JSON.stringify(sampleReports[0]) },
    });
  });
});
