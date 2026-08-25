import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { mockRouter } from "@/jest.setup";
import { useUpdateProductStockMutation } from "@/services/mutations/useUpdateProductStockMutation";
import { useProductsQuery } from "@/services/queries/useProductsQuery";
import type { Product } from "@/services/types/Product";
import StockProducts from "../StockProducts";

jest.mock("@/services/queries/useProductsQuery", () => ({
  useProductsQuery: jest.fn(),
}));

jest.mock("@/services/mutations/useUpdateProductStockMutation", () => ({
  useUpdateProductStockMutation: jest.fn(),
}));

jest.mock("@/services/queries/useStockMovementsQuery", () => ({
  useStockMovementsQuery: jest.fn().mockReturnValue({
    data: { pages: [{ content: [] }] },
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  }),
}));

describe("StockProducts component", () => {
  const sampleProducts: Product[] = [
    {
      id: "p-1",
      name: "Americano",
      categoryName: "Coffee",
      categoryCode: "COFFEE",
      stock: 120,
      sellingPrice: 25000,
      deletedAt: null,
    } as any,
    {
      id: "p-2",
      name: "Croissant",
      categoryName: "Bakery",
      categoryCode: "BAKERY",
      stock: 20, // < 50 => Low Stock
      sellingPrice: 18000,
      deletedAt: null,
    } as any,
    {
      id: "p-3",
      name: "Bagel",
      categoryName: "Bakery",
      categoryCode: "BAKERY",
      stock: 0, // <= 0 => Out of Stock
      sellingPrice: 15000,
      deletedAt: null,
    } as any,
    {
      id: "p-4",
      name: "Old Soda",
      categoryName: "Drink",
      categoryCode: "DRINK",
      stock: 5,
      sellingPrice: 10000,
      deletedAt: "2026-08-01T00:00:00Z", // Inactive
    } as any,
  ];

  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useProductsQuery as jest.Mock).mockReturnValue({
      data: { content: sampleProducts, totalElements: 4 },
      isLoading: false,
    });
    (useUpdateProductStockMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it("renders product table headers and rows with status badges", async () => {
    await render(<StockProducts />);

    expect(screen.getByText("Product Name")).toBeTruthy();
    expect(screen.getByText("Americano")).toBeTruthy();
    expect(screen.getByText("In Stock")).toBeTruthy();
    expect(screen.getByText("Croissant")).toBeTruthy();
    expect(screen.getByText("Low Stock")).toBeTruthy();
    expect(screen.getByText("Bagel")).toBeTruthy();
    expect(screen.getByText("Out of Stock")).toBeTruthy();
    expect(screen.getByText("Old Soda")).toBeTruthy();
    expect(screen.getByText("Inactive")).toBeTruthy();
  });

  it("renders skeleton loader when products are loading", async () => {
    (useProductsQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    await render(<StockProducts />);

    expect(screen.queryByText("Americano")).toBeNull();
  });

  it("renders empty state when there are no products", async () => {
    (useProductsQuery as jest.Mock).mockReturnValue({
      data: { content: [] },
      isLoading: false,
    });

    await render(<StockProducts />);

    expect(screen.getByText("No Products Found")).toBeTruthy();
  });

  it("navigates to product edit screen when Edit button is pressed", async () => {
    await render(<StockProducts />);

    const editButtons = screen.getAllByText("Edit");
    await act(async () => {
      fireEvent.press(editButtons[0]);
    });

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/product/add",
      params: { id: "p-1" },
    });
  });

  it("opens stock update modal and executes mutation on save", async () => {
    const { getAllByTestId } = await render(<StockProducts />);

    // IcEdit icon button inside stock column
    const editStockIcons = getAllByTestId("svg-mock");
    await act(async () => {
      fireEvent.press(editStockIcons[0]);
    });

    expect(screen.getByText("Update Stock for Americano")).toBeTruthy();

    const saveBtn = screen.getByText("Save");
    await act(async () => {
      fireEvent.press(saveBtn);
    });

    expect(mockMutate).toHaveBeenCalledWith(
      {
        id: "p-1",
        stock: 120,
        reason: "Manual correction via App",
      },
      expect.any(Object),
    );
  });

  it("opens history drawer when History button is pressed", async () => {
    await render(<StockProducts />);

    const historyButtons = screen.getAllByText("History");
    await act(async () => {
      fireEvent.press(historyButtons[0]);
    });

    expect(screen.getByText("Stock History: Americano")).toBeTruthy();
  });
});
