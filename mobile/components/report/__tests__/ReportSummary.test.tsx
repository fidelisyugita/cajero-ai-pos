import { render, screen } from "@testing-library/react-native";
import type { ReportSummary as ReportSummaryType } from "@/services/types/Report";
import { formatCurrency } from "@/utils/Format";
import ReportSummary from "../ReportSummary";

describe("ReportSummary component", () => {
  const sampleSummary: ReportSummaryType = {
    totalTransaction: 120,
    totalProductSold: 250,
    totalRevenue: 8500000,
    totalRefund: 150000,
    totalCogs: 2500000,
    totalNetRevenue: 8350000,
    totalTax: 850000,
    totalExpenses: 500000,
    totalDiscount: 200000,
    totalRefundTransaction: 2,
    totalRefundProduct: 3,
    paymentMethods: [],
    commissions: [],
  };

  it("renders summary cards with standard net revenue when includeCogs is false", async () => {
    await render(<ReportSummary summary={sampleSummary} includeCogs={false} />);

    expect(screen.getByText("Total Transaction")).toBeTruthy();
    expect(screen.getByText("120")).toBeTruthy();

    expect(screen.getByText("Total Item Sold")).toBeTruthy();
    expect(screen.getByText("250")).toBeTruthy();

    expect(screen.getByText("Total Revenue")).toBeTruthy();
    expect(screen.getByText(formatCurrency(8500000))).toBeTruthy();

    expect(screen.getByText("Total Refund")).toBeTruthy();
    expect(screen.getByText(formatCurrency(150000))).toBeTruthy();

    expect(screen.getByText("Total COGS")).toBeTruthy();
    expect(screen.getByText(formatCurrency(2500000))).toBeTruthy();

    expect(screen.getByText("Total Net Revenue")).toBeTruthy();
    expect(screen.getByText(formatCurrency(8350000))).toBeTruthy();
  });

  it("adjusts net revenue calculation and updates label when includeCogs is true", async () => {
    await render(<ReportSummary summary={sampleSummary} includeCogs={true} />);

    expect(screen.getByText("Net Revenue (w/ COGS)")).toBeTruthy();
    // 8350000 - 2500000 = 5850000
    expect(screen.getByText(formatCurrency(5850000))).toBeTruthy();
  });

  it("hides Total COGS card when totalCogs is zero or null", async () => {
    const summaryNoCogs: ReportSummaryType = {
      ...sampleSummary,
      totalCogs: 0,
    };

    await render(<ReportSummary summary={summaryNoCogs} includeCogs={false} />);

    expect(screen.queryByText("Total COGS")).toBeNull();
  });
});
