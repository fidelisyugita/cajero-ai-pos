import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useDeleteCategoryMutation } from "@/services/mutations/useDeleteCategoryMutation";
import { useProductCategoriesQuery } from "@/services/queries/useProductCategoriesQuery";
import type { ProductCategory } from "@/services/types/ProductCategory";
import { useCategoryStore } from "@/store/useMenuCategoryStore";
import CategoryFilter from "../CategoryFilter";

jest.mock("@/services/queries/useProductCategoriesQuery", () => ({
  useProductCategoriesQuery: jest.fn(),
}));

jest.mock("@/services/mutations/useDeleteCategoryMutation", () => ({
  useDeleteCategoryMutation: jest.fn(),
}));

describe("CategoryFilter component", () => {
  const sampleCategories: ProductCategory[] = [
    {
      code: "COFFEE",
      name: "Coffee",
      description: "Hot and cold coffee",
      storeId: "store-1",
      createdBy: "u-1",
      updatedBy: "u-1",
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-01T00:00:00Z",
      deletedAt: null,
    },
    {
      code: "SNACK",
      name: "Snack & Bakery",
      description: "Pastries",
      storeId: "store-1",
      createdBy: "u-1",
      updatedBy: "u-1",
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-01T00:00:00Z",
      deletedAt: null,
    },
  ];

  const mockDeleteMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert");
    useCategoryStore.setState({
      selectedCategory: "ALL",
      searchQuery: "",
    });
    (useProductCategoriesQuery as jest.Mock).mockReturnValue({
      data: sampleCategories,
      isLoading: false,
    });
    (useDeleteCategoryMutation as jest.Mock).mockReturnValue({
      mutate: mockDeleteMutate,
    });
  });

  it("renders 'All' category button along with API category list", async () => {
    await render(<CategoryFilter />);

    expect(screen.getByText("All")).toBeTruthy();
    expect(screen.getByText("Coffee")).toBeTruthy();
    expect(screen.getByText("Snack & Bakery")).toBeTruthy();
  });

  it("updates selected category in useCategoryStore when a category button is pressed", async () => {
    await render(<CategoryFilter />);

    const coffeeBtn = screen.getByText("Coffee");
    await act(async () => {
      fireEvent.press(coffeeBtn);
    });

    expect(useCategoryStore.getState().selectedCategory).toBe("COFFEE");
  });

  it("hides the component completely when searchQuery has 2 or more characters", async () => {
    useCategoryStore.setState({ searchQuery: "Lat" });
    const { toJSON } = await render(<CategoryFilter />);

    expect(toJSON()).toBeNull();
    expect(screen.queryByText("All")).toBeNull();
  });

  it("renders delete button on categories when editable is true, but not on 'All'", async () => {
    const { getAllByTestId } = await render(<CategoryFilter editable />);

    // IcX svg mocks rendered on non-ALL items
    const deleteIcons = getAllByTestId("svg-mock");
    expect(deleteIcons.length).toBe(2);
  });

  it("prompts confirmation alert and triggers deleteCategory mutation when confirmed", async () => {
    const { getAllByTestId } = await render(<CategoryFilter editable />);

    const deleteIcons = getAllByTestId("svg-mock");
    await act(async () => {
      fireEvent.press(deleteIcons[0]);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Delete Category",
      "Are you sure you want to delete Coffee?",
      expect.any(Array),
    );

    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const deleteAction = alertButtons.find((btn: any) => btn.text === "Delete");
    expect(deleteAction).toBeTruthy();

    await act(async () => {
      deleteAction.onPress();
    });

    expect(mockDeleteMutate).toHaveBeenCalledWith("COFFEE");
  });
});
