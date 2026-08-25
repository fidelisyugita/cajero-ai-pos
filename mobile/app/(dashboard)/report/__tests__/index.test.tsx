import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type React from "react";
import { useReportsQuery } from "@/services/queries/useReportsQuery";
import { useAuthStore } from "@/store/useAuthStore";
import { useReferenceStore } from "@/store/useReferenceStore";
import ReportScreen from "../index";

jest.mock("@/services/queries/useReportsQuery", () => ({
  useReportsQuery: jest.fn(),
}));

jest.mock("react-native-ui-datepicker", () => {
  const React = require("react");
  const { View } = require("react-native");
  return () => React.createElement(View, { testID: "date-time-picker" });
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("ReportScreen integration", () => {
  const sampleReportData = {
    summary: {
      totalTransaction: 80,
      totalProductSold: 160,
      totalRevenue: 5000000,
      totalRefund: 100000,
      totalCogs: 1500000,
      totalNetRevenue: 4900000,
      totalTax: 500000,
      totalExpenses: 200000,
      totalDiscount: 100000,
      totalRefundTransaction: 1,
      totalRefundProduct: 2,
      paymentMethods: [],
      commissions: [],
    },
    dailyReports: [
      {
        date: "2026-08-25",
        totalTransaction: 40,
        totalProductSold: 80,
        totalRevenue: 2500000,
        totalDiscount: 50000,
        totalTax: 250000,
        totalExpenses: 100000,
        totalCogs: 750000,
        totalRefund: 50000,
        totalRefundTransaction: 1,
        totalRefundProduct: 1,
        totalNetRevenue: 2450000,
        paymentMethods: [{ paymentMethod: "CASH", totalAmount: 2500000 }],
        commissions: [],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useReferenceStore.setState({
      transactionTypes: [{ code: "DINE_IN", name: "Dine In" } as any],
      paymentMethods: [],
      transactionStatuses: [],
      fetchAll: jest.fn(),
    });
    useAuthStore.setState({
      user: {
        id: "u-1",
        name: "Manager Mike",
        roleCode: "MANAGER",
      } as any,
    });
    (useReportsQuery as jest.Mock).mockReturnValue({
      data: sampleReportData,
      isLoading: false,
    });
  });

  it("renders ReportScreen layout with Header, COGS toggle, ReportSummary, and ReportList", async () => {
    await render(<ReportScreen />, { wrapper: createWrapper() });

    expect(screen.getByText("Manager Mike")).toBeTruthy();
    expect(screen.getByText("COGS: OFF")).toBeTruthy();
    expect(screen.getByText("Export")).toBeTruthy();
    expect(screen.getByText("Total Transaction")).toBeTruthy();
    expect(screen.getAllByText("80").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("25 Aug 2026")).toBeTruthy();
  });

  it("toggles COGS calculation state on button press", async () => {
    await render(<ReportScreen />, { wrapper: createWrapper() });

    const cogsToggleBtn = screen.getByText("COGS: OFF");
    await act(async () => {
      fireEvent.press(cogsToggleBtn);
    });

    expect(screen.getByText("COGS: ON")).toBeTruthy();
    expect(screen.getByText("Net Revenue (w/ COGS)")).toBeTruthy();
  });

  it("opens DateRangeModal when date button is pressed", async () => {
    await render(<ReportScreen />, { wrapper: createWrapper() });

    // The date range button title in Header
    const dateBtn = screen.getByText(/\d{2}\/\d{2}\/\d{4} - \d{2}\/\d{2}\/\d{4}/);
    await act(async () => {
      fireEvent.press(dateBtn);
    });

    expect(screen.getByText("Select Date Range")).toBeTruthy();
  });
});
