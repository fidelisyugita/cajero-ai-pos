import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useUpdateVariantStockMutation } from "@/services/mutations/useUpdateVariantStockMutation";
import { useProductsQuery } from "@/services/queries/useProductsQuery";
import { useVariantsQuery } from "@/services/queries/useVariantsQuery";
import type { Variant } from "@/services/types/Variant";
import StockVariants from "../StockVariants";

jest.mock("@/services/queries/useVariantsQuery", () => ({
  useVariantsQuery: jest.fn(),
}));

jest.mock("@/services/queries/useProductsQuery", () => ({
  useProductsQuery: jest.fn(),
}));

jest.mock("@/services/queries/useProductQuery", () => ({
  useProductQuery: jest.fn().mockReturnValue({
    data: { id: "p-1", name: "Iced Tea" },
    isLoading: false,
  }),
}));

jest.mock("@/services/mutations/useUpdateVariantStockMutation", () => ({
  useUpdateVariantStockMutation: jest.fn(),
}));

jest.mock("@/services/mutations/useUpdateVariantMutation", () => ({
  useUpdateVariantMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

jest.mock("@/services/queries/useStockMovementsQuery", () => ({
  useStockMovementsQuery: jest.fn().mockReturnValue({
    data: { pages: [{ content: [] }] },
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  }),
}));

describe("StockVariants component", () => {
  const sampleProducts = [
    { id: "p-1", name: "Iced Tea" },
    { id: "p-2", name: "Latte" },
  ];

  const sampleVariants: Variant[] = [
    {
      id: "v-1",
      name: "Sugar Level",
      description: "Sugar options",
      productId: "p-1",
      isRequired: true,
      isMultiple: false,
      options: [
        {
          id: "opt-1",
          name: "Less Sugar",
          priceAdjusment: 0,
          stock: 25, // In Stock
          ingredients: [],
        },
        {
          id: "opt-2",
          name: "No Sugar",
          priceAdjusment: 0,
          stock: 5, // < 10 => Low Stock
          ingredients: [],
        },
        {
          id: "opt-3",
          name: "Extra Sugar",
          priceAdjusment: 1000,
          stock: 0, // <= 0 => Out of Stock
          ingredients: [],
        },
      ],
    } as any,
  ];

  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useVariantsQuery as jest.Mock).mockReturnValue({
      data: sampleVariants,
      isLoading: false,
    });
    (useProductsQuery as jest.Mock).mockReturnValue({
      data: { content: sampleProducts, totalElements: 2 },
      isLoading: false,
    });
    (useUpdateVariantStockMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it("renders flattened variant table with mapped product names and status badges", async () => {
    await render(<StockVariants />);

    expect(screen.getByText("Variant Name")).toBeTruthy();
    expect(screen.getAllByText("Iced Tea").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Sugar Level - Less Sugar")).toBeTruthy();
    expect(screen.getByText("In Stock")).toBeTruthy();
    expect(screen.getByText("Sugar Level - No Sugar")).toBeTruthy();
    expect(screen.getByText("Low Stock")).toBeTruthy();
    expect(screen.getByText("Sugar Level - Extra Sugar")).toBeTruthy();
    expect(screen.getByText("Out of Stock")).toBeTruthy();
  });

  it("filters variants based on search query matching variant, option, or product name", async () => {
    const { rerender } = await render(<StockVariants searchQuery="Less" />);

    expect(screen.getByText("Sugar Level - Less Sugar")).toBeTruthy();
    expect(screen.queryByText("Sugar Level - No Sugar")).toBeNull();

    await rerender(<StockVariants searchQuery="Latte" />);
    expect(screen.getByText("No Variants Found")).toBeTruthy();
  });

  it("renders skeleton loader when queries are loading", async () => {
    (useVariantsQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    await render(<StockVariants />);

    expect(screen.queryByText("Sugar Level - Less Sugar")).toBeNull();
  });

  it("renders empty state when there are no variants", async () => {
    (useVariantsQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    await render(<StockVariants />);

    expect(screen.getByText("No Variants Found")).toBeTruthy();
  });

  it("opens stock update modal and calls updateVariantStockMutation", async () => {
    const { getAllByTestId } = await render(<StockVariants />);

    const editIcons = getAllByTestId("svg-mock");
    await act(async () => {
      fireEvent.press(editIcons[0]);
    });

    expect(screen.getByText("Update Stock for Sugar Level - Extra Sugar")).toBeTruthy();

    const saveBtn = screen.getByText("Save");
    await act(async () => {
      fireEvent.press(saveBtn);
    });

    expect(mockMutate).toHaveBeenCalledWith(
      {
        id: "opt-3",
        stock: 0,
        reason: "Manual correction via App",
      },
      expect.any(Object),
    );
  });

  it("opens history drawer when History button is pressed", async () => {
    await render(<StockVariants />);

    const historyButtons = screen.getAllByText("History");
    await act(async () => {
      fireEvent.press(historyButtons[0]);
    });

    expect(screen.getByText("Stock History: Iced Tea - Sugar Level - Extra Sugar")).toBeTruthy();
  });
});
