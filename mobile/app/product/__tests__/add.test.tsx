import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import type React from "react";
import { useCreateProductMutation } from "@/services/mutations/useCreateProductMutation";
import { useProductCategoriesQuery } from "@/services/queries/useProductCategoriesQuery";
import { useProductQuery } from "@/services/queries/useProductQuery";
import { useVariantsQuery } from "@/services/queries/useVariantsQuery";
import { useAuthStore } from "@/store/useAuthStore";
import useImageSelectionStore from "@/store/useImageSelectionStore";
import { useCategoryStore } from "@/store/useProductCategoryStore";
import { useVariantStore } from "@/store/useVariantStore";
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

jest.mock("@/services/mutations/useCreateVariantMutation", () => ({
  useCreateVariantMutation: jest.fn(() => ({ mutateAsync: jest.fn().mockResolvedValue({}) })),
}));

jest.mock("@/services/mutations/useUpdateVariantMutation", () => ({
  useUpdateVariantMutation: jest.fn(() => ({ mutateAsync: jest.fn().mockResolvedValue({}) })),
}));

jest.mock("@/services/mutations/useDeleteVariantMutation", () => ({
  useDeleteVariantMutation: jest.fn(() => ({ mutateAsync: jest.fn().mockResolvedValue({}) })),
}));

jest.mock("@/services/mutations/useUploadImageMutation", () => ({
  useUploadImageMutation: jest.fn(() => ({ mutateAsync: jest.fn().mockResolvedValue({}) })),
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

  it("resets auxiliary stores (useVariantStore and useImageSelectionStore) on Save & Add More", async () => {
    const mockAddProduct = jest.fn().mockResolvedValue({ id: "prod-1" });
    (useCreateProductMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockAddProduct,
      isPending: false,
    });

    useImageSelectionStore.setState({
      imageUri: "https://example.com/food.jpg",
    });
    useVariantStore.setState({
      variants: [
        {
          id: "v-1",
          name: "Level Pedas",
          isRequired: true,
          isMultiple: false,
          options: [],
        },
      ],
    });

    await render(<AddProductScreen />, { wrapper: createWrapper() });

    // Fill product name and price
    const nameInput = screen.getByPlaceholderText("Product Name *");
    const priceInput = screen.getByPlaceholderText("Price *");

    fireEvent.changeText(nameInput, "Nasi Goreng Spesial");
    fireEvent.changeText(priceInput, "35000");

    // Press Save & Add More
    const saveAndAddMoreBtn = screen.getByText("Save & Add More");
    fireEvent.press(saveAndAddMoreBtn);

    await waitFor(() => {
      expect(mockAddProduct).toHaveBeenCalled();
      expect(useImageSelectionStore.getState().imageUri).toBeFalsy();
      expect(useVariantStore.getState().variants).toEqual([]);
    });
  });
});
