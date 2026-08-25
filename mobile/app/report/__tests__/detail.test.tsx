import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { mockRouter } from "@/jest.setup";
import type { DailyReport } from "@/services/types/Report";
import { formatCurrency } from "@/utils/Format";
import ReportDetailScreen from "../detail";

const mockUseLocalSearchParams = jest.fn();
jest.mock("expo-router", () => ({
  router: mockRouter,
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockUseLocalSearchParams(),
  Stack: {
    Screen: () => null,
  },
}));

describe("ReportDetailScreen", () => {
  const sampleReport: DailyReport = {
    date: "2026-08-25",
    totalTransaction: 55,
    totalProductSold: 110,
    totalRevenue: 3500000,
    totalDiscount: 150000,
    totalTax: 350000,
    totalExpenses: 400000,
    totalCogs: 1000000,
    totalRefund: 75000,
    totalRefundTransaction: 1,
    totalRefundProduct: 2,
    totalNetRevenue: 3425000,
    paymentMethods: [
      { paymentMethod: "CASH", totalAmount: 2000000 },
      { paymentMethod: "QRIS", totalAmount: 1500000 },
    ],
    commissions: [{ cashierName: "Alice", totalCommission: 120000 }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders 'Report not found' when report param is absent or invalid", async () => {
    mockUseLocalSearchParams.mockReturnValue({});

    await render(<ReportDetailScreen />);

    expect(screen.getByText("Report not found")).toBeTruthy();
  });

  it("renders report details breakdown cards when valid report param is provided", async () => {
    mockUseLocalSearchParams.mockReturnValue({
      report: JSON.stringify(sampleReport),
    });

    await render(<ReportDetailScreen />);

    expect(screen.getByText("Report Details")).toBeTruthy();
    expect(screen.getByText("Tuesday, 25 August 2026")).toBeTruthy();

    // Sales Breakdown
    expect(screen.getByText("Sales")).toBeTruthy();
    expect(screen.getByText("55")).toBeTruthy();
    expect(screen.getByText("110")).toBeTruthy();
    expect(screen.getByText(formatCurrency(3500000))).toBeTruthy();
    expect(screen.getByText(formatCurrency(150000))).toBeTruthy();

    // Refund Breakdown
    expect(screen.getByText("Refund")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText(formatCurrency(75000))).toBeTruthy();

    // Payment Methods Breakdown
    expect(screen.getByText("Payment Method")).toBeTruthy();
    expect(screen.getByText("CASH")).toBeTruthy();
    expect(screen.getByText(formatCurrency(2000000))).toBeTruthy();
    expect(screen.getByText("QRIS")).toBeTruthy();
    expect(screen.getByText(formatCurrency(1500000))).toBeTruthy();

    // Tax & Expenses Breakdown
    expect(screen.getByText(formatCurrency(350000))).toBeTruthy();
    expect(screen.getByText(formatCurrency(400000))).toBeTruthy();

    // Commission Breakdown
    expect(screen.getByText("Total Commission (Alice)")).toBeTruthy();
    expect(screen.getByText(formatCurrency(120000))).toBeTruthy();

    // COGS Breakdown
    expect(screen.getByText("COGS")).toBeTruthy();
    expect(screen.getByText(formatCurrency(1000000))).toBeTruthy();
  });

  it("toggles COGS on and updates net revenue accordingly", async () => {
    mockUseLocalSearchParams.mockReturnValue({
      report: JSON.stringify(sampleReport),
    });

    await render(<ReportDetailScreen />);

    const cogsBtn = screen.getByText("COGS: OFF");
    await act(async () => {
      fireEvent.press(cogsBtn);
    });

    expect(screen.getByText("COGS: ON")).toBeTruthy();
    expect(screen.getByText("Net Revenue (w/ COGS)")).toBeTruthy();
    // 3425000 - 1000000 = 2425000
    expect(screen.getByText(formatCurrency(2425000))).toBeTruthy();
  });

  it("navigates back when Cancel button is pressed", async () => {
    mockUseLocalSearchParams.mockReturnValue({
      report: JSON.stringify(sampleReport),
    });

    await render(<ReportDetailScreen />);

    const cancelBtn = screen.getByText("Cancel");
    await act(async () => {
      fireEvent.press(cancelBtn);
    });

    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });
});
