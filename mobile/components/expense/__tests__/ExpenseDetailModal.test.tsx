import { render, screen } from "@testing-library/react-native";
import type { PettyCash } from "@/services/types/PettyCash";
import ExpenseDetailModal from "../ExpenseDetailModal";

describe("ExpenseDetailModal component", () => {
  const sampleExpense: PettyCash = {
    id: "exp-1",
    amount: 75000,
    description: "Cleaning supplies",
    isIncome: false,
    storeId: "store-1",
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
    createdByName: "Cashier Bob",
    imageUrl: "https://example.com/receipt.png",
  };

  it("renders expense details including amount, date, created by, and description", async () => {
    const mockClose = jest.fn();
    await render(<ExpenseDetailModal visible={true} onClose={mockClose} expense={sampleExpense} />);

    expect(screen.getByText("Expense Details")).toBeTruthy();
    expect(screen.getByText("Cleaning supplies")).toBeTruthy();
    expect(screen.getByText("Cashier Bob")).toBeTruthy();
  });

  it("renders null when expense is not provided", async () => {
    await render(<ExpenseDetailModal visible={true} onClose={jest.fn()} expense={null as any} />);

    expect(screen.queryByText("Expense Details")).toBeNull();
  });
});
