import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type React from "react";
import { useIngredientsQuery } from "@/services/queries/useIngredientsQuery";
import { useProductsQuery } from "@/services/queries/useProductsQuery";
import { useVariantsQuery } from "@/services/queries/useVariantsQuery";
import { useAuthStore } from "@/store/useAuthStore";
import { useReferenceStore } from "@/store/useReferenceStore";
import StockScreen from "../index";

jest.mock("@/db/drizzle", () => ({
  db: {
    update: jest.fn(() => ({
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue({ rowsAffected: 1 }),
    })),
  },
}));

jest.mock("@/services/queries/useIngredientsQuery", () => ({
  useIngredientsQuery: jest.fn(),
}));

jest.mock("@/services/queries/useProductsQuery", () => ({
  useProductsQuery: jest.fn(),
}));

jest.mock("@/services/queries/useVariantsQuery", () => ({
  useVariantsQuery: jest.fn(),
}));

jest.mock("@/services/queries/useStockMovementsQuery", () => ({
  useStockMovementsQuery: jest.fn().mockReturnValue({
    data: { pages: [{ content: [] }] },
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("StockScreen integration", () => {
  const sampleIngredients = [
    {
      id: "ing-1",
      name: "Coffee Beans",
      measureUnitCode: "GRAM",
      stock: 3000,
      description: "",
      storeId: "store-1",
      createdBy: "u-1",
      updatedBy: "u-1",
      createdAt: "",
      updatedAt: "",
      deletedAt: "",
    },
  ];

  const sampleProducts = [
    {
      id: "prod-1",
      name: "Espresso",
      categoryName: "Coffee",
      stock: 50,
      sellingPrice: 20000,
      deletedAt: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useReferenceStore.setState({
      transactionTypes: [{ code: "DINE_IN", name: "Dine In" } as any],
      paymentMethods: [],
      transactionStatuses: [],
      fetchAll: jest.fn(),
    });
    useAuthStore.setState({
      user: {
        id: "u-1",
        name: "Admin User",
        roleCode: "OWNER",
      } as any,
    });
    (useIngredientsQuery as jest.Mock).mockReturnValue({
      data: sampleIngredients,
      isLoading: false,
    });
    (useProductsQuery as jest.Mock).mockReturnValue({
      data: { content: sampleProducts, totalElements: 1 },
      isLoading: false,
    });
    (useVariantsQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  it("renders StockScreen with active Ingredients tab by default", async () => {
    await render(<StockScreen />, { wrapper: createWrapper() });

    expect(screen.getByPlaceholderText("Search Ingredients")).toBeTruthy();
    expect(screen.getByText("Coffee Beans")).toBeTruthy();
  });

  it("switches to Products tab when Products segment is pressed", async () => {
    await render(<StockScreen />, { wrapper: createWrapper() });

    const productsTab = screen.getByText("Products");
    await act(async () => {
      fireEvent.press(productsTab);
    });

    expect(screen.getByPlaceholderText("Search Products")).toBeTruthy();
    expect(screen.getByText("Espresso")).toBeTruthy();
  });

  it("opens and closes ingredient history modal on ingredient history press", async () => {
    await render(<StockScreen />, { wrapper: createWrapper() });

    const historyBtn = screen.getByText("History");
    await act(async () => {
      fireEvent.press(historyBtn);
    });

    expect(screen.getByText("Stock History: Coffee Beans")).toBeTruthy();

    const closeBtn = screen.getByText("Close");
    await act(async () => {
      fireEvent.press(closeBtn);
    });

    expect(screen.queryByText("Stock History: Coffee Beans")).toBeNull();
  });
});
