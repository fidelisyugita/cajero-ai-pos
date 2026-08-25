import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useUpdateIngredientMutation } from "@/services/mutations/useUpdateIngredientMutation";
import { useUpdateIngredientStockMutation } from "@/services/mutations/useUpdateIngredientStockMutation";
import { useIngredientsQuery } from "@/services/queries/useIngredientsQuery";
import type { Ingredient } from "@/services/types/Ingredient";
import StockIngredients from "../StockIngredients";

jest.mock("@/services/queries/useIngredientsQuery", () => ({
  useIngredientsQuery: jest.fn(),
}));

jest.mock("@/services/queries/useMeasureUnitsQuery", () => ({
  useMeasureUnitsQuery: jest.fn().mockReturnValue({
    data: [{ code: "GRAM", name: "Gram" }],
    isLoading: false,
  }),
}));

jest.mock("@/services/mutations/useUpdateIngredientStockMutation", () => ({
  useUpdateIngredientStockMutation: jest.fn(),
}));

jest.mock("@/services/mutations/useUpdateIngredientMutation", () => ({
  useUpdateIngredientMutation: jest.fn(),
}));

describe("StockIngredients component", () => {
  const sampleIngredients: Ingredient[] = [
    {
      id: "ing-1",
      name: "Espresso Beans",
      measureUnitCode: "GRAM",
      stock: 5000, // In Stock
      description: "Arabica beans",
      storeId: "store-1",
      createdBy: "u-1",
      updatedBy: "u-1",
      createdAt: "",
      updatedAt: "",
      deletedAt: "",
    },
    {
      id: "ing-2",
      name: "Oat Milk",
      measureUnitCode: "ML",
      stock: 30, // < 50 => Low Stock
      description: "Organic Oat Milk",
      storeId: "store-1",
      createdBy: "u-1",
      updatedBy: "u-1",
      createdAt: "",
      updatedAt: "",
      deletedAt: "",
    },
    {
      id: "ing-3",
      name: "Vanilla Syrup",
      measureUnitCode: "ML",
      stock: 0, // <= 0 => Out of Stock
      description: "Sugar free",
      storeId: "store-1",
      createdBy: "u-1",
      updatedBy: "u-1",
      createdAt: "",
      updatedAt: "",
      deletedAt: "",
    },
  ];

  const mockStockMutate = jest.fn();
  const mockDetailMutate = jest.fn();
  const mockOnIngredientPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useIngredientsQuery as jest.Mock).mockReturnValue({
      data: sampleIngredients,
      isLoading: false,
    });
    (useUpdateIngredientStockMutation as jest.Mock).mockReturnValue({
      mutate: mockStockMutate,
      isPending: false,
    });
    (useUpdateIngredientMutation as jest.Mock).mockReturnValue({
      mutate: mockDetailMutate,
      isPending: false,
    });
  });

  it("renders ingredients table headers and items with status badges", async () => {
    await render(<StockIngredients onIngredientPress={mockOnIngredientPress} />);

    expect(screen.getByText("Ingredient Name")).toBeTruthy();
    expect(screen.getByText("Espresso Beans")).toBeTruthy();
    expect(screen.getByText("In Stock")).toBeTruthy();
    expect(screen.getByText("Oat Milk")).toBeTruthy();
    expect(screen.getByText("Low Stock")).toBeTruthy();
    expect(screen.getByText("Vanilla Syrup")).toBeTruthy();
    expect(screen.getByText("Out of Stock")).toBeTruthy();
  });

  it("filters ingredients based on search query", async () => {
    const { rerender } = await render(
      <StockIngredients onIngredientPress={mockOnIngredientPress} searchQuery="Oat" />,
    );

    expect(screen.getByText("Oat Milk")).toBeTruthy();
    expect(screen.queryByText("Espresso Beans")).toBeNull();

    await rerender(
      <StockIngredients onIngredientPress={mockOnIngredientPress} searchQuery="NonExistent" />,
    );
    expect(screen.getByText("No Ingredients Found")).toBeTruthy();
  });

  it("renders skeleton loader when ingredients are loading", async () => {
    (useIngredientsQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    await render(<StockIngredients onIngredientPress={mockOnIngredientPress} />);

    expect(screen.queryByText("Espresso Beans")).toBeNull();
  });

  it("calls onIngredientPress when History button is pressed", async () => {
    await render(<StockIngredients onIngredientPress={mockOnIngredientPress} />);

    const historyButtons = screen.getAllByText("History");
    await act(async () => {
      fireEvent.press(historyButtons[0]);
    });

    expect(mockOnIngredientPress).toHaveBeenCalledWith(sampleIngredients[0]);
  });

  it("opens stock update modal and executes updateIngredientStockMutation on save", async () => {
    const { getAllByTestId } = await render(
      <StockIngredients onIngredientPress={mockOnIngredientPress} />,
    );

    const editStockIcons = getAllByTestId("svg-mock");
    await act(async () => {
      fireEvent.press(editStockIcons[0]);
    });

    expect(screen.getByText("Update Stock for Espresso Beans")).toBeTruthy();

    const saveBtn = screen.getByText("Save");
    await act(async () => {
      fireEvent.press(saveBtn);
    });

    expect(mockStockMutate).toHaveBeenCalledWith(
      {
        id: "ing-1",
        stock: 5000,
        reason: "Manual correction via App",
      },
      expect.any(Object),
    );
  });

  it("opens edit detail modal and executes updateIngredientMutation on save", async () => {
    await render(<StockIngredients onIngredientPress={mockOnIngredientPress} />);

    const editButtons = screen.getAllByText("Edit");
    await act(async () => {
      fireEvent.press(editButtons[0]);
    });

    expect(screen.getByText("Edit Ingredient")).toBeTruthy();

    const saveBtn = screen.getByText("Save");
    await act(async () => {
      fireEvent.press(saveBtn);
    });

    expect(mockDetailMutate).toHaveBeenCalledWith(
      {
        id: "ing-1",
        data: {
          name: "Espresso Beans",
          measureUnitCode: "GRAM",
          description: "Arabica beans",
          stock: 5000,
        },
      },
      expect.any(Object),
    );
  });
});
