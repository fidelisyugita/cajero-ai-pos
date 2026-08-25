import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useStockMovementsQuery } from "@/services/queries/useStockMovementsQuery";
import type { Ingredient } from "@/services/types/Ingredient";
import type { StockMovement } from "@/services/types/StockMovement";
import StockIngredientHistory from "../StockIngredientHistory";

jest.mock("@/services/queries/useStockMovementsQuery", () => ({
  useStockMovementsQuery: jest.fn(),
}));

describe("StockIngredientHistory component", () => {
  const sampleIngredient: Ingredient = {
    id: "ing-1",
    name: "Matcha Powder",
    measureUnitCode: "GRAM",
    stock: 200,
    description: "",
    storeId: "store-1",
    createdBy: "u-1",
    updatedBy: "u-1",
    createdAt: "",
    updatedAt: "",
    deletedAt: "",
  };

  const sampleMovements: StockMovement[] = [
    {
      id: "sm-1",
      createdAt: "2026-08-25T10:00:00.000Z",
      type: "IN",
      quantity: 500,
      createdByName: "Admin",
      transactionDescription: "Restock Delivery",
    } as any,
    {
      id: "sm-2",
      createdAt: "2026-08-25T12:00:00.000Z",
      type: "OUT",
      quantity: 50,
      createdByName: "Cashier",
      transactionDescription: "Sales usage",
    } as any,
  ];

  const mockFetchNextPage = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useStockMovementsQuery as jest.Mock).mockReturnValue({
      data: {
        pages: [{ content: sampleMovements }],
      },
      fetchNextPage: mockFetchNextPage,
      hasNextPage: true,
      isFetchingNextPage: false,
    });
  });

  it("returns null when ingredient is null", async () => {
    const { toJSON } = await render(
      <StockIngredientHistory ingredient={null} onClose={mockOnClose} />,
    );

    expect(toJSON()).toBeNull();
  });

  it("renders stock history modal with movements list", async () => {
    await render(<StockIngredientHistory ingredient={sampleIngredient} onClose={mockOnClose} />);

    expect(screen.getByText("Stock History: Matcha Powder")).toBeTruthy();
    expect(screen.getByText("IN")).toBeTruthy();
    expect(screen.getByText("500")).toBeTruthy();
    expect(screen.getByText("Restock Delivery")).toBeTruthy();
    expect(screen.getByText("OUT")).toBeTruthy();
    expect(screen.getByText("50")).toBeTruthy();
    expect(screen.getByText("Sales usage")).toBeTruthy();
  });

  it("displays empty state when movement list is empty", async () => {
    (useStockMovementsQuery as jest.Mock).mockReturnValue({
      data: { pages: [{ content: [] }] },
      fetchNextPage: mockFetchNextPage,
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    await render(<StockIngredientHistory ingredient={sampleIngredient} onClose={mockOnClose} />);

    expect(screen.getByText("No history found.")).toBeTruthy();
  });

  it("calls onClose when Close button is pressed", async () => {
    await render(<StockIngredientHistory ingredient={sampleIngredient} onClose={mockOnClose} />);

    const closeBtn = screen.getByText("Close");
    await act(async () => {
      fireEvent.press(closeBtn);
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
