import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { mockRouter } from "@/jest.setup";
import { useTransactionsQuery } from "@/services/queries/useTransactionsQuery";
import type { TransactionResponse } from "@/services/types/Transaction";
import { formatCurrency } from "@/utils/Format";
import ReceiptsList from "../ReceiptsList";

jest.mock("@/services/queries/useTransactionsQuery", () => ({
  useTransactionsQuery: jest.fn(),
}));

describe("ReceiptsList component", () => {
  const sampleTransactions: TransactionResponse[] = [
    {
      id: "TRX-99887766-5544",
      createdAt: "2026-08-25T08:30:00.000Z",
      description: "Order for Sarah - Table 3",
      paymentMethodCode: "CASH",
      totalPrice: 85000,
      statusCode: "COMPLETED",
      transactionProduct: [
        {
          id: "tp-1",
          productId: "p-1",
          sellingPrice: 35000,
          quantity: 2,
          name: "Iced Latte",
        } as any,
      ],
    } as any,
    {
      id: "TRX-11223344-5566",
      createdAt: "2026-08-25T09:15:00.000Z",
      description: "",
      paymentMethodCode: "QRIS",
      totalPrice: 45000,
      statusCode: "REFUND",
      transactionProduct: [],
    } as any,
  ];

  const mockFetchNextPage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading skeleton while query is loading", async () => {
    (useTransactionsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      fetchNextPage: mockFetchNextPage,
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    await render(<ReceiptsList />);

    // Should not render transaction table rows while loading
    expect(screen.queryByText("CASH")).toBeNull();
    expect(screen.queryByText("TRX-99887...")).toBeNull();
  });

  it("renders transaction table with formatted data and status badges", async () => {
    (useTransactionsQuery as jest.Mock).mockReturnValue({
      data: {
        pages: [{ content: sampleTransactions, page: 1, totalPages: 1 }],
      },
      isLoading: false,
      fetchNextPage: mockFetchNextPage,
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    await render(<ReceiptsList />);

    expect(screen.getByText("Transaction ID")).toBeTruthy();
    expect(screen.getByText("TRX-9988...")).toBeTruthy();
    expect(screen.getByText("Sarah")).toBeTruthy();
    expect(screen.getByText("CASH")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText(formatCurrency(85000))).toBeTruthy();
    expect(screen.getByText("COMPLETED")).toBeTruthy();

    expect(screen.getByText("TRX-1122...")).toBeTruthy();
    expect(screen.getByText("-")).toBeTruthy();
    expect(screen.getByText("QRIS")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText(formatCurrency(45000))).toBeTruthy();
    expect(screen.getByText("REFUND")).toBeTruthy();
  });

  it("renders EmptyState when transaction list is empty", async () => {
    (useTransactionsQuery as jest.Mock).mockReturnValue({
      data: {
        pages: [{ content: [], page: 1, totalPages: 1 }],
      },
      isLoading: false,
      fetchNextPage: mockFetchNextPage,
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    await render(<ReceiptsList />);

    expect(screen.getByText("No Transactions Found")).toBeTruthy();
    expect(screen.getByText("No transactions found for the selected date.")).toBeTruthy();
  });

  it("triggers detail navigation when 'Detail' button is pressed", async () => {
    (useTransactionsQuery as jest.Mock).mockReturnValue({
      data: {
        pages: [{ content: sampleTransactions, page: 1, totalPages: 1 }],
      },
      isLoading: false,
      fetchNextPage: mockFetchNextPage,
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    await render(<ReceiptsList />);

    const detailButtons = screen.getAllByText("Detail");
    await act(async () => {
      fireEvent.press(detailButtons[0]);
    });

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/receipt/detail",
      params: { transaction: JSON.stringify(sampleTransactions[0]) },
    });
  });

  it("shows loading more footer when isFetchingNextPage is true", async () => {
    (useTransactionsQuery as jest.Mock).mockReturnValue({
      data: {
        pages: [{ content: sampleTransactions, page: 1, totalPages: 2 }],
      },
      isLoading: false,
      fetchNextPage: mockFetchNextPage,
      hasNextPage: true,
      isFetchingNextPage: true,
    } as any);

    await render(<ReceiptsList />);

    expect(screen.getByText("Loading more...")).toBeTruthy();
  });

  it("calls fetchNextPage on end reached when hasNextPage is true", async () => {
    (useTransactionsQuery as jest.Mock).mockReturnValue({
      data: {
        pages: [{ content: sampleTransactions, page: 1, totalPages: 2 }],
      },
      isLoading: false,
      fetchNextPage: mockFetchNextPage,
      hasNextPage: true,
      isFetchingNextPage: false,
    } as any);

    await render(<ReceiptsList />);

    const element = screen.getByText("Sarah");
    let current: any = element.parent;
    while (current && !current.props?.onEndReached) {
      current = current.parent;
    }

    if (current?.props?.onEndReached) {
      await act(async () => {
        current.props.onEndReached();
      });
      expect(mockFetchNextPage).toHaveBeenCalled();
    }
  });
});
