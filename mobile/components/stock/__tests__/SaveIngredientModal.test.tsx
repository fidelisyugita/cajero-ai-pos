import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useMeasureUnitsQuery } from "@/services/queries/useMeasureUnitsQuery";
import type { Ingredient } from "@/services/types/Ingredient";
import SaveIngredientModal from "../SaveIngredientModal";

jest.mock("@/services/queries/useMeasureUnitsQuery", () => ({
  useMeasureUnitsQuery: jest.fn(),
}));

describe("SaveIngredientModal component", () => {
  const sampleIngredient: Ingredient = {
    id: "ing-1",
    name: "Cinnamon Powder",
    measureUnitCode: "GRAM",
    description: "Ground cinnamon",
    stock: 100,
    storeId: "store-1",
    createdBy: "u-1",
    updatedBy: "u-1",
    createdAt: "",
    updatedAt: "",
    deletedAt: "",
  };

  const sampleMeasureUnits = [
    { code: "GRAM", name: "Gram" },
    { code: "KG", name: "Kilogram" },
    { code: "ML", name: "Milliliter" },
  ];

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useMeasureUnitsQuery as jest.Mock).mockReturnValue({
      data: sampleMeasureUnits,
      isLoading: false,
    });
  });

  it("pre-populates form fields from ingredient prop", async () => {
    await render(
      <SaveIngredientModal
        ingredient={sampleIngredient}
        onClose={mockOnClose}
        onSave={mockOnSave}
        visible={true}
      />,
    );

    expect(screen.getByDisplayValue("Cinnamon Powder")).toBeTruthy();
    expect(screen.getByDisplayValue("Ground cinnamon")).toBeTruthy();
    expect(screen.getByText("Edit Ingredient")).toBeTruthy();
  });

  it("updates fields and submits updated ingredient data on Save", async () => {
    await render(
      <SaveIngredientModal
        ingredient={sampleIngredient}
        onClose={mockOnClose}
        onSave={mockOnSave}
        visible={true}
      />,
    );

    const nameInput = screen.getByDisplayValue("Cinnamon Powder");
    await act(async () => {
      fireEvent.changeText(nameInput, "Ceylon Cinnamon");
    });

    const saveBtn = screen.getByText("Save");
    await act(async () => {
      fireEvent.press(saveBtn);
    });

    expect(mockOnSave).toHaveBeenCalledWith({
      name: "Ceylon Cinnamon",
      measureUnitCode: "GRAM",
      description: "Ground cinnamon",
    });
  });

  it("invokes onClose when Cancel button is pressed", async () => {
    await render(
      <SaveIngredientModal
        ingredient={sampleIngredient}
        onClose={mockOnClose}
        onSave={mockOnSave}
        visible={true}
      />,
    );

    const cancelBtn = screen.getByText("Cancel");
    await act(async () => {
      fireEvent.press(cancelBtn);
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
