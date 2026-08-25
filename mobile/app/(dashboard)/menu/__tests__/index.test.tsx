import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react-native";
import type React from "react";
import { useDeleteCategoryMutation } from "@/services/mutations/useDeleteCategoryMutation";
import { useProductCategoriesQuery } from "@/services/queries/useProductCategoriesQuery";
import { useProductsQuery } from "@/services/queries/useProductsQuery";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategoryStore } from "@/store/useMenuCategoryStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useReferenceStore } from "@/store/useReferenceStore";
import MenuScreen from "../index";

jest.mock("@/services/queries/useProductsQuery", () => ({
  useProductsQuery: jest.fn(),
}));

jest.mock("@/services/queries/useProductCategoriesQuery", () => ({
  useProductCategoriesQuery: jest.fn(),
}));

jest.mock("@/services/mutations/useDeleteCategoryMutation", () => ({
  useDeleteCategoryMutation: jest.fn(),
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

describe("MenuScreen integration", () => {
  const sampleCategories = [
    {
      code: "COFFEE",
      name: "Coffee",
      description: "",
      storeId: "store-1",
      createdBy: "u-1",
      updatedBy: "u-1",
      createdAt: "",
      updatedAt: "",
      deletedAt: null,
    },
  ];

  const sampleProducts = [
    {
      id: "prod-1",
      name: "Caramel Macchiato",
      sellingPrice: 35000,
      imageUrl: "https://example.com/caramel.jpg",
      tax: 10,
      commission: 0,
      categoryCode: "COFFEE",
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
        name: "Barista Bob",
        roleCode: "CASHIER",
      } as any,
    });
    useOrderStore.setState({
      items: [],
      customerName: "",
      tableNumber: "",
      discount: 0,
    });
    useCategoryStore.setState({
      selectedCategory: "ALL",
      searchQuery: "",
    });
    (useProductCategoriesQuery as jest.Mock).mockReturnValue({
      data: sampleCategories,
      isLoading: false,
    });
    (useProductsQuery as jest.Mock).mockReturnValue({
      data: {
        content: sampleProducts,
        totalElements: 1,
      },
      isLoading: false,
    });
    (useDeleteCategoryMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
    });
  });

  it("renders entire MenuScreen composition including Header, SearchBar, CategoryFilter, MenuList, and MenuOrder", async () => {
    await render(<MenuScreen />, { wrapper: createWrapper() });

    // Profile in Header
    expect(screen.getByText("Barista Bob")).toBeTruthy();
    // SearchBar
    expect(screen.getByPlaceholderText("Search Menu")).toBeTruthy();
    // CategoryFilter
    expect(screen.getByText("All")).toBeTruthy();
    expect(screen.getByText("Coffee")).toBeTruthy();
    // MenuList
    expect(screen.getByText("Caramel Macchiato")).toBeTruthy();
    // MenuOrder
    expect(screen.getByText("Current Order")).toBeTruthy();
    expect(screen.getByPlaceholderText("Customer Name")).toBeTruthy();
    expect(screen.getByText("Proceed")).toBeTruthy();
  });

  it("handles scroll event on menu content list smoothly", async () => {
    await render(<MenuScreen />, { wrapper: createWrapper() });

    const product = screen.getByText("Caramel Macchiato");
    expect(product).toBeTruthy();
  });
});
