import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type React from "react";
import { getReports } from "../../endpoints/getReports";
import { useReportsQuery } from "../useReportsQuery";

jest.mock("../../endpoints/getReports", () => ({
  getReports: jest.fn(),
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useReportsQuery", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("fetches report data successfully when startDate and endDate are provided", async () => {
    const mockReportData = {
      totalGrossSales: 1500000,
      totalNetSales: 1350000,
      totalOrders: 42,
      totalDiscount: 150000,
      totalTax: 0,
      summary: [],
    };

    (getReports as jest.Mock).mockResolvedValue(mockReportData);

    const params = {
      startDate: "2026-08-01",
      endDate: "2026-08-25",
    };

    const { result } = await renderHook(() => useReportsQuery(params), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getReports).toHaveBeenCalledWith(params);
    expect(result.current.data).toEqual(mockReportData);
  });

  it("does not fetch data when startDate or endDate is missing", async () => {
    const { result: noEndResult } = await renderHook(
      () => useReportsQuery({ startDate: "2026-08-01", endDate: "" }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    expect(noEndResult.current.fetchStatus).toBe("idle");
    expect(getReports).not.toHaveBeenCalled();

    const { result: noStartResult } = await renderHook(
      () => useReportsQuery({ startDate: "", endDate: "2026-08-25" }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    expect(noStartResult.current.fetchStatus).toBe("idle");
    expect(getReports).not.toHaveBeenCalled();
  });

  it("handles error when getReports rejects", async () => {
    const mockError = new Error("Failed to fetch reports");
    (getReports as jest.Mock).mockRejectedValue(mockError);

    const { result } = await renderHook(
      () =>
        useReportsQuery({
          startDate: "2026-08-01",
          endDate: "2026-08-25",
        }),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(mockError);
  });
});
