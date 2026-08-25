import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert } from "react-native";
import { t } from "@/services/i18n";
import { useVariantsQuery } from "@/services/queries/useVariantsQuery";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useOrderStore } from "@/store/useOrderStore";
import { formatCurrency } from "@/utils/Format";
import AddItemModal from "../add-item";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock("@/services/queries/useVariantsQuery", () => ({
  useVariantsQuery: jest.fn(),
}));

describe("AddItemModal", () => {
  const mockDismiss = jest.fn();

  const mockProductParams = {
    id: "prod-1",
    name: "Cappuccino",
    sellingPrice: "35000",
    imageUrl: "https://example.com/cappuccino.png",
    tax: "10",
    commission: "0",
  };

  const mockVariants = [
    {
      id: "v-size",
      productId: "prod-1",
      name: "Size",
      isRequired: true,
      isMultiple: false,
      options: [
        { id: "opt-regular", name: "Regular", priceAdjusment: 0 },
        { id: "opt-large", name: "Large", priceAdjusment: 10000 },
      ],
    },
    {
      id: "v-toppings",
      productId: "prod-1",
      name: "Toppings",
      isRequired: false,
      isMultiple: true,
      options: [
        { id: "opt-caramel", name: "Caramel Drizzle", priceAdjusment: 5000 },
        { id: "opt-whip", name: "Extra Whip", priceAdjusment: 4000 },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      dismiss: mockDismiss,
    });
    (useLocalSearchParams as jest.Mock).mockReturnValue(mockProductParams);
    (useVariantsQuery as jest.Mock).mockReturnValue({
      data: mockVariants,
      isLoading: false,
    });

    useBusinessStore.setState({
      business: {
        id: "store-1",
        name: "Test Store",
        address: "Address",
        phone: "123",
        email: "store@cajero.com",
        maxDiscount: 20, // 20% max discount
      },
    });

    useOrderStore.setState({
      items: [],
      discount: 0,
    });

    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  it("renders product info, initial quantity, and add CTA button", async () => {
    await render(<AddItemModal />);

    expect(screen.getByText(t("add_item"))).toBeTruthy();
    expect(screen.getByText("Cappuccino")).toBeTruthy();
    expect(screen.getByText(formatCurrency(35000))).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy(); // Initial quantity
    expect(screen.getByText(t("add_to_order_list"))).toBeTruthy();
  });

  it("increments and decrements quantity correctly", async () => {
    await render(<AddItemModal />);

    expect(screen.getByText("1")).toBeTruthy();

    const svgMocks = screen.getAllByTestId("svg-mock");
    // svgMocks[0] is close button, svgMocks[1] is minus icon, svgMocks[2] is plus icon
    await act(async () => {
      fireEvent.press(svgMocks[2]);
    });
    expect(screen.getByText("2")).toBeTruthy();

    // Decrement
    await act(async () => {
      fireEvent.press(svgMocks[1]);
    });
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("handles single-select radio button variants selection", async () => {
    await render(<AddItemModal />);

    expect(screen.getByText("Size *")).toBeTruthy();
    expect(screen.getByText("Regular")).toBeTruthy();
    expect(screen.getByText("Large")).toBeTruthy();

    // Press Large option
    const largeOption = screen.getByText("Large");
    await act(async () => {
      fireEvent.press(largeOption);
    });

    // Submit item
    const addButton = screen.getByText(t("add_to_order_list"));
    await act(async () => {
      fireEvent.press(addButton);
    });

    const addedItems = useOrderStore.getState().items;
    expect(addedItems).toHaveLength(1);
    expect(addedItems[0].name).toBe("Cappuccino");
    expect(addedItems[0].variants).toEqual([
      {
        groupId: "v-size",
        groupName: "Size",
        optionId: "opt-large",
        name: "Large",
        price: 10000,
      },
    ]);
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it("handles multi-select checkbox variants selection", async () => {
    await render(<AddItemModal />);

    // Select both caramel and whip
    await act(async () => {
      fireEvent.press(screen.getByText("Caramel Drizzle"));
      fireEvent.press(screen.getByText("Extra Whip"));
    });

    const addButton = screen.getByText(t("add_to_order_list"));
    await act(async () => {
      fireEvent.press(addButton);
    });

    const addedItems = useOrderStore.getState().items;
    expect(addedItems[0].variants).toHaveLength(2);
    expect(addedItems[0].variants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Caramel Drizzle", price: 5000 }),
        expect.objectContaining({ name: "Extra Whip", price: 4000 }),
      ]),
    );
  });

  it("hydrates existing item details when in edit mode", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      ...mockProductParams,
      orderItemId: "order-item-1",
      initialQuantity: "3",
      initialNote: "Less ice please",
      initialDiscount: "5000",
      initialVariants: JSON.stringify([{ groupId: "v-size", optionId: "opt-large" }]),
    });

    // Seed existing order item
    useOrderStore.setState({
      items: [
        {
          id: "order-item-1",
          productId: "prod-1",
          name: "Cappuccino",
          sellingPrice: 35000,
          quantity: 3,
          variants: [
            {
              groupId: "v-size",
              groupName: "Size",
              optionId: "opt-large",
              name: "Large",
              price: 10000,
            },
          ],
          note: "Less ice please",
          discount: 5000,
          tax: 10,
          commission: 0,
        },
      ],
    });

    await render(<AddItemModal />);

    expect(screen.getByText(t("edit_item"))).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByDisplayValue("Less ice please")).toBeTruthy();
    expect(screen.getByDisplayValue("5000")).toBeTruthy();
    expect(screen.getByText(t("update_order"))).toBeTruthy();

    // Submit update
    const updateButton = screen.getByText(t("update_order"));
    await act(async () => {
      fireEvent.press(updateButton);
    });

    const items = useOrderStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("order-item-1");
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it("prevents entering discount higher than maximum allowed discount", async () => {
    await render(<AddItemModal />);

    // Product price = 35000, quantity = 1, maxDiscount = 20% -> max allowed = 7000
    const discountInput = screen.getByPlaceholderText("Discount");
    await act(async () => {
      // Trying to set 10000 (> 7000)
      fireEvent.changeText(discountInput, "10000");
    });

    // Value should not be updated to 10000
    expect(screen.queryByDisplayValue("10000")).toBeNull();
  });
});
