import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import type React from "react";
import { useCreateProductCategoryMutation } from "@/services/mutations/useCreateProductCategoryMutation";
import { useProductCategoriesQuery } from "@/services/queries/useProductCategoriesQuery";
import { useCategoryStore } from "@/store/useProductCategoryStore";
import SelectCategoryModal from "../select-category";

jest.mock("@/services/queries/useProductCategoriesQuery", () => ({
  useProductCategoriesQuery: jest.fn(),
}));

jest.mock("@/services/mutations/useCreateProductCategoryMutation", () => ({
  useCreateProductCategoryMutation: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("SelectCategoryModal integration", () => {
  const mockCategories = [
    { code: "COFFEE", name: "Coffee" },
    { code: "SNACK", name: "Snack" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useCategoryStore.setState({
      selectedCategory: undefined,
      newCategoryName: "",
    });
    (useProductCategoriesQuery as jest.Mock).mockReturnValue({
      data: mockCategories,
      isLoading: false,
    });
    (useCreateProductCategoryMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  it("renders category selection and category list", async () => {
    await render(<SelectCategoryModal />, { wrapper: createWrapper() });

    expect(screen.getByText("Select Category")).toBeTruthy();
    expect(screen.getByText("Add Category")).toBeTruthy();
    expect(screen.getByText("Coffee")).toBeTruthy();
    expect(screen.getByText("Snack")).toBeTruthy();
  });

  it("selects a category and enables Select button", async () => {
    await render(<SelectCategoryModal />, { wrapper: createWrapper() });

    const coffeeItem = screen.getByText("Coffee");
    await act(async () => {
      fireEvent.press(coffeeItem);
    });

    expect(useCategoryStore.getState().selectedCategory?.code).toBe("COFFEE");

    const selectBtn = screen.getByText("Select");
    await act(async () => {
      fireEvent.press(selectBtn);
    });

    expect(router.dismiss).toHaveBeenCalled();
  });
});
