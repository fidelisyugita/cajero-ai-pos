import { fireEvent, render, screen } from "@testing-library/react-native";
import { useProductQuery } from "@/services/queries/useProductQuery";
import { useStockMovementsQuery } from "@/services/queries/useStockMovementsQuery";
import type { StockMovement } from "@/services/types/StockMovement";
import type { Variant, VariantOption } from "@/services/types/Variant";
import StockVariantHistory from "../StockVariantHistory";

jest.mock("@/services/queries/useProductQuery", () => ({
  useProductQuery: jest.fn(),
}));

jest.mock("@/services/queries/useStockMovementsQuery", () => ({
  useStockMovementsQuery: jest.fn(),
}));

describe("StockVariantHistory component", () => {
  const sampleVariant: Variant = {
    id: "var-1",
    name: "Size",
    productId: "prod-10",
  } as any;

  const sampleOption: VariantOption = {
    id: "opt-1",
    name: "Large",
    variantId: "var-1",
    stock: 50,
  } as any;

  const sampleMovements: StockMovement[] = [
    {
      id: "sm-v-1",
      variantId: "opt-1",
      quantity: 5,
      type: "SOLD",
      createdAt: "2026-03-01T12:00:00.000Z",
      createdByName: "Cashier 1",
      transactionDescription: "POS Sale #12",
    } as any,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useProductQuery as jest.Mock).mockReturnValue({
      data: { id: "prod-10", name: "Latte" },
      isLoading: false,
    });
  });

  it("renders variant stock history and movements", async () => {
    (useStockMovementsQuery as jest.Mock).mockReturnValue({
      data: { pages: [{ content: sampleMovements }] },
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
    });

    const mockClose = jest.fn();
    await render(
      <StockVariantHistory variant={sampleVariant} option={sampleOption} onClose={mockClose} />,
    );

    expect(screen.getByText("Stock History: Latte - Size - Large")).toBeTruthy();
    expect(screen.getByText("SOLD")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("POS Sale #12")).toBeTruthy();

    const closeBtn = screen.getByText("Close");
    fireEvent.press(closeBtn);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("renders empty message when no movements exist", async () => {
    (useStockMovementsQuery as jest.Mock).mockReturnValue({
      data: { pages: [{ content: [] }] },
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      isFetchingNextPage: false,
    });

    await render(
      <StockVariantHistory variant={sampleVariant} option={sampleOption} onClose={jest.fn()} />,
    );

    expect(screen.getByText("No history found.")).toBeTruthy();
  });
});
