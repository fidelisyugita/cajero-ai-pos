import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type React from "react";
import { useTransactionsQuery } from "@/services/queries/useTransactionsQuery";
import { useAuthStore } from "@/store/useAuthStore";
import { useDraftStore } from "@/store/useDraftStore";
import ReceiptScreen from "../index";

jest.mock("@/services/queries/useTransactionsQuery", () => ({
  useTransactionsQuery: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("ReceiptScreen integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: { id: "u-1", name: "Barista Bob" } as any,
    });
    useDraftStore.setState({
      drafts: [],
    });
    (useTransactionsQuery as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            content: [
              {
                id: "tx-1",
                invoiceNumber: "INV-001",
                grandTotal: 50000,
                status: "PAID",
                paymentMethod: "CASH",
                createdAt: "2026-03-01T10:00:00.000Z",
                items: [],
              },
            ],
            totalElements: 1,
          },
        ],
      },
      isLoading: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
    });
  });

  it("renders receipt screen and switches between Transactions and Drafts", async () => {
    await render(<ReceiptScreen />, { wrapper: createWrapper() });

    expect(screen.getByText("Transactions")).toBeTruthy();
    expect(screen.getByText("Drafts")).toBeTruthy();

    const draftsTab = screen.getByText("Drafts");
    await act(async () => {
      fireEvent.press(draftsTab);
    });

    expect(screen.getByPlaceholderText("Search Drafts")).toBeTruthy();
  });
});
