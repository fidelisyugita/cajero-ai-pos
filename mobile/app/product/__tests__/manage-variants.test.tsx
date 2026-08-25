import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import { useVariantStore } from "@/store/useVariantStore";
import ManageVariantsScreen from "../manage-variants";

describe("ManageVariantsScreen integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useVariantStore.setState({
      variants: [
        {
          id: "var-1",
          name: "Size Option",
          isRequired: true,
          isMultiple: false,
          options: [{ id: "opt-1", name: "Large", stock: 10, priceAdjusment: 5000 }],
        },
      ],
    });
  });

  it("renders configured variants list and handles add variant navigation", async () => {
    await render(<ManageVariantsScreen />);

    expect(screen.getByText("Size Option")).toBeTruthy();
    expect(screen.getByText("Add New Variant")).toBeTruthy();

    const addBtn = screen.getByText("Add New Variant");
    fireEvent.press(addBtn);

    expect(router.push).toHaveBeenCalledWith("/modal/product/edit-variant");
  });
});
