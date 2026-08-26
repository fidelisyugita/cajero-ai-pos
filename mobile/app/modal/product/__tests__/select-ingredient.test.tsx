import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import type React from "react";
import { useCreateIngredientMutation } from "@/services/mutations/useCreateIngredientMutation";
import { useIngredientsQuery } from "@/services/queries/useIngredientsQuery";
import { useMeasureUnitsQuery } from "@/services/queries/useMeasureUnitsQuery";
import { useAuthStore } from "@/store/useAuthStore";
import { useIngredientStore } from "@/store/useIngredientStore";
import SelectIngredientModal from "../select-ingredient";

jest.mock("@/services/queries/useIngredientsQuery", () => ({
  useIngredientsQuery: jest.fn(),
}));

jest.mock("@/services/queries/useMeasureUnitsQuery", () => ({
  useMeasureUnitsQuery: jest.fn(),
}));

jest.mock("@/services/mutations/useCreateIngredientMutation", () => ({
  useCreateIngredientMutation: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("SelectIngredientModal integration", () => {
  const mockIngredients = [
    { id: "ing-1", name: "Whole Milk", measureUnitCode: "ML", stock: 1000 },
    { id: "ing-2", name: "Sugar", measureUnitCode: "GR", stock: 500 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: { id: "u-1", storeId: "store-1" } as any,
    });
    useIngredientStore.setState({
      selectedIngredient: null,
      newIngredientName: "",
    });
    (useIngredientsQuery as jest.Mock).mockReturnValue({
      data: mockIngredients,
      isLoading: false,
    });
    (useMeasureUnitsQuery as jest.Mock).mockReturnValue({
      data: [{ code: "ML", name: "Milliliter" }],
      isLoading: false,
    });
    (useCreateIngredientMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
  });

  it("renders ingredients list and adds ingredient to selection", async () => {
    await render(<SelectIngredientModal />, { wrapper: createWrapper() });

    expect(screen.getByText("Select Ingredient")).toBeTruthy();
    expect(screen.getByText("Add Ingredient")).toBeTruthy();
    expect(screen.getByText("Whole Milk")).toBeTruthy();
    expect(screen.getByText("Sugar")).toBeTruthy();

    const milkItem = screen.getByText("Whole Milk");
    await act(async () => {
      fireEvent.press(milkItem);
    });

    expect(useIngredientStore.getState().selectedIngredient?.some((i) => i.id === "ing-1")).toBe(
      true,
    );

    const saveBtn = screen.getByText("Save");
    await act(async () => {
      fireEvent.press(saveBtn);
    });

    expect(router.dismiss).toHaveBeenCalled();
  });
});
