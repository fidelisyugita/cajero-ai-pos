import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import type React from "react";
import { useCreateProductMutation } from "@/services/mutations/useCreateProductMutation";
import { useProductCategoriesQuery } from "@/services/queries/useProductCategoriesQuery";
import { useProductQuery } from "@/services/queries/useProductQuery";
import { useVariantsQuery } from "@/services/queries/useVariantsQuery";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategoryStore } from "@/store/useProductCategoryStore";
import AddProductScreen from "../add";

jest.mock("@/services/queries/useProductCategoriesQuery", () => ({
  useProductCategoriesQuery: jest.fn(),
}));

jest.mock("@/services/queries/useProductQuery", () => ({
  useProductQuery: jest.fn(),
}));

jest.mock("@/services/queries/useVariantsQuery", () => ({
  useVariantsQuery: jest.fn(),
}));

jest.mock("@/services/mutations/useCreateProductMutation", () => ({
  useCreateProductMutation: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("AddProductScreen integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
    useAuthStore.setState({
      user: { id: "u-1", storeId: "store-1" } as any,
    });
    useCategoryStore.setState({
      selectedCategory: { code: "COFFEE", name: "Coffee" },
    });
    (useProductCategoriesQuery as jest.Mock).mockReturnValue({
      data: [{ code: "COFFEE", name: "Coffee" }],
      isLoading: false,
    });
    (useProductQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });
    (useVariantsQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (useCreateProductMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
  });

  it("renders product form sections and interactive buttons", async () => {
    await render(<AddProductScreen />, { wrapper: createWrapper() });

    expect(screen.getByText(/Product Image/i)).toBeTruthy();
    expect(screen.getByText(/Product Category/i)).toBeTruthy();
    expect(screen.getAllByText(/Variants/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Product Information/i)).toBeTruthy();
    expect(screen.getByText(/Product Ingredient/i)).toBeTruthy();
    expect(screen.getByText("Change Category")).toBeTruthy();
    expect(screen.getByText("Manage Variants")).toBeTruthy();
    expect(screen.getByText("Add Ingredient")).toBeTruthy();
  });
});
