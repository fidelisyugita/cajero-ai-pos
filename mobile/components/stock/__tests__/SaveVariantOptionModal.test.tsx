import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { VariantOption } from "@/services/types/Variant";
import SaveVariantOptionModal from "../SaveVariantOptionModal";

describe("SaveVariantOptionModal component", () => {
  const sampleOption: VariantOption = {
    id: "opt-1",
    name: "Extra Espresso Shot",
    priceAdjusment: 5000,
    stock: 20,
    variantId: "v-1",
    ingredients: [],
  };

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("pre-populates modal form fields with existing option values", async () => {
    await render(
      <SaveVariantOptionModal
        option={sampleOption}
        onClose={mockOnClose}
        onSave={mockOnSave}
        visible={true}
      />,
    );

    expect(screen.getByDisplayValue("Extra Espresso Shot")).toBeTruthy();
    expect(screen.getByDisplayValue("5000")).toBeTruthy();
    expect(screen.getByText("Edit Option")).toBeTruthy();
  });

  it("updates option details and invokes onSave with parsed numeric price adjustment", async () => {
    await render(
      <SaveVariantOptionModal
        option={sampleOption}
        onClose={mockOnClose}
        onSave={mockOnSave}
        visible={true}
      />,
    );

    const nameInput = screen.getByDisplayValue("Extra Espresso Shot");
    await act(async () => {
      fireEvent.changeText(nameInput, "Double Espresso Shot");
    });

    const priceInput = screen.getByDisplayValue("5000");
    await act(async () => {
      fireEvent.changeText(priceInput, "8000");
    });

    const saveBtn = screen.getByText("Save");
    await act(async () => {
      fireEvent.press(saveBtn);
    });

    expect(mockOnSave).toHaveBeenCalledWith({
      name: "Double Espresso Shot",
      priceAdjusment: 8000,
    });
  });

  it("invokes onClose when Cancel button is pressed", async () => {
    await render(
      <SaveVariantOptionModal
        option={sampleOption}
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
