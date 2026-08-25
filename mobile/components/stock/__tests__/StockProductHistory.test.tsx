import { fireEvent, render, screen } from "@testing-library/react-native";
import { useStockMovementsQuery } from "@/services/queries/useStockMovementsQuery";
import type { Product } from "@/services/types/Product";
import type { StockMovement } from "@/services/types/StockMovement";
import StockProductHistory from "../StockProductHistory";

jest.mock("@/services/queries/useStockMovementsQuery", () => ({
  useStockMovementsQuery: jest.fn(),
}));

describe("StockProductHistory component", () => {
  const sampleProduct: Product = {
    id: "prod-1",
    name: "Espresso Beans 1kg",
    sellingPrice: 150000,
    costPrice: 80000,
    stock: 20,
    categoryCode: "COFFEE",
  } as any;

  const sampleMovements: StockMovement[] = [
    {
      id: "sm-1",
      productId: "prod-1",
      quantity: 10,
      type: "IN",
      createdAt: "2026-03-01T08:00:00.000Z",
      createdByName: "Warehouse Staff",
      transactionDescription: "Restock order #100",
    } as any,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders product stock history modal and movements", async () => {
    (useStockMovementsQuery as jest.Mock).mockReturnValue({
      data: {
        pages: [{ content: sampleMovements }],
      },
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
    });

    const mockClose = jest.fn();
    await render(<StockProductHistory product={sampleProduct} onClose={mockClose} />);

    expect(screen.getByText("Stock History: Espresso Beans 1kg")).toBeTruthy();
    expect(screen.getByText("IN")).toBeTruthy();
    expect(screen.getByText("10")).toBeTruthy();
    expect(screen.getByText("Warehouse Staff")).toBeTruthy();
    expect(screen.getByText("Restock order #100")).toBeTruthy();

    const closeBtn = screen.getByText("Close");
    fireEvent.press(closeBtn);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("renders empty text when no history is present", async () => {
    (useStockMovementsQuery as jest.Mock).mockReturnValue({
      data: { pages: [{ content: [] }] },
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
    });

    await render(<StockProductHistory product={sampleProduct} onClose={jest.fn()} />);

    expect(screen.getByText("No history found.")).toBeTruthy();
  });

  it("returns null when product is null", async () => {
    const { toJSON } = await render(<StockProductHistory product={null} onClose={jest.fn()} />);

    expect(toJSON()).toBeNull();
  });
});
