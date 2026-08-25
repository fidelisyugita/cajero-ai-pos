import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { usePettyCashQuery } from "@/services/queries/usePettyCashQuery";
import type { PettyCash } from "@/services/types/PettyCash";
import ExpenseList from "../ExpenseList";

jest.mock("@/services/queries/usePettyCashQuery", () => ({
  usePettyCashQuery: jest.fn(),
}));

describe("ExpenseList component", () => {
  const sampleExpenses: PettyCash[] = [
    {
      id: "exp-1",
      amount: 45000,
      description: "Coffee filters pack",
      isIncome: false,
      storeId: "store-1",
      createdAt: "2026-03-01T10:00:00.000Z",
      updatedAt: "2026-03-01T10:00:00.000Z",
      createdByName: "Cashier Bob",
    },
    {
      id: "exp-2",
      amount: 150000,
      description: "Cash float addition",
      isIncome: true,
      storeId: "store-1",
      createdAt: "2026-03-01T11:00:00.000Z",
      updatedAt: "2026-03-01T11:00:00.000Z",
      createdByName: "Manager Alice",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders expense list items and columns", async () => {
    (usePettyCashQuery as jest.Mock).mockReturnValue({
      data: {
        content: sampleExpenses,
        totalElements: 2,
      },
      isLoading: false,
    });

    await render(<ExpenseList />);

    expect(screen.getByText("Description")).toBeTruthy();
    expect(screen.getByText("Coffee filters pack")).toBeTruthy();
    expect(screen.getByText("Cash float addition")).toBeTruthy();
    expect(screen.getByText("Expense")).toBeTruthy();
    expect(screen.getByText("Income")).toBeTruthy();
  });

  it("opens expense detail modal on pressing Detail button", async () => {
    (usePettyCashQuery as jest.Mock).mockReturnValue({
      data: {
        content: sampleExpenses,
        totalElements: 2,
      },
      isLoading: false,
    });

    await render(<ExpenseList />);

    const detailButtons = screen.getAllByText("Detail");
    await act(async () => {
      fireEvent.press(detailButtons[0]);
    });

    expect(screen.getByText("Expense Details")).toBeTruthy();
    expect(screen.getByText("Cashier Bob")).toBeTruthy();
  });

  it("renders empty state when no expenses exist", async () => {
    (usePettyCashQuery as jest.Mock).mockReturnValue({
      data: { content: [], totalElements: 0 },
      isLoading: false,
    });

    await render(<ExpenseList />);

    expect(screen.getByText("No Expenses Found")).toBeTruthy();
  });
});
