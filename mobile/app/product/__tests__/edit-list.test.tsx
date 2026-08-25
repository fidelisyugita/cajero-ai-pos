import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react-native";
import type React from "react";
import { useProductCategoriesQuery } from "@/services/queries/useProductCategoriesQuery";
import { useProductsQuery } from "@/services/queries/useProductsQuery";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategoryStore } from "@/store/useMenuCategoryStore";
import EditListScreen from "../edit-list";

jest.mock("@/services/queries/useProductCategoriesQuery", () => ({
  useProductCategoriesQuery: jest.fn(),
}));

jest.mock("@/services/queries/useProductsQuery", () => ({
  useProductsQuery: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("EditListScreen integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: { id: "u-1", name: "Owner John", roleCode: "OWNER" } as any,
    });
    useCategoryStore.setState({
      selectedCategory: "ALL",
      searchQuery: "",
    });
    (useProductCategoriesQuery as jest.Mock).mockReturnValue({
      data: [{ code: "COFFEE", name: "Coffee" }],
      isLoading: false,
    });
    (useProductsQuery as jest.Mock).mockReturnValue({
      data: {
        content: [
          {
            id: "prod-1",
            name: "Americano",
            sellingPrice: 25000,
            categoryCode: "COFFEE",
          },
        ],
        totalElements: 1,
      },
      isLoading: false,
    });
  });

  it("renders editable category filter and editable menu list", async () => {
    await render(<EditListScreen />, { wrapper: createWrapper() });

    expect(screen.getByText("All")).toBeTruthy();
    expect(screen.getByText("Coffee")).toBeTruthy();
    expect(screen.getByText("Americano")).toBeTruthy();
  });
});
