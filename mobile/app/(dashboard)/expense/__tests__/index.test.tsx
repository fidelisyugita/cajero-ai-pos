import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import type React from "react";
import { usePettyCashQuery } from "@/services/queries/usePettyCashQuery";
import { useAuthStore } from "@/store/useAuthStore";
import ExpenseScreen from "../index";

jest.mock("@/services/queries/usePettyCashQuery", () => ({
  usePettyCashQuery: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("ExpenseScreen integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: { id: "u-1", name: "Cashier Bob" } as any,
    });
    (usePettyCashQuery as jest.Mock).mockReturnValue({
      data: {
        content: [
          {
            id: "exp-1",
            amount: 50000,
            description: "Supplies",
            isIncome: false,
            createdAt: "2026-03-01T10:00:00.000Z",
          },
        ],
        totalElements: 1,
      },
      isLoading: false,
    });
  });

  it("renders expense list and navigates to add expense on button press", async () => {
    await render(<ExpenseScreen />, { wrapper: createWrapper() });

    expect(screen.getByText("Add Expense")).toBeTruthy();
    expect(screen.getByText("Supplies")).toBeTruthy();

    const addBtn = screen.getByText("Add Expense");
    fireEvent.press(addBtn);

    expect(router.push).toHaveBeenCalledWith("/expense/add");
  });
});
