import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { mockRouter } from "@/jest.setup";
import { useOrderStore } from "@/store/useOrderStore";
import { formatCurrency } from "@/utils/Format";
import ListOrder from "../ListOrder";

describe("ListOrder component", () => {
  const sampleItems = [
    {
      id: "item-1",
      productId: "prod-1",
      name: "Americano",
      sellingPrice: 25000,
      quantity: 2,
      discount: 2000,
      tax: 1000,
      commission: 500,
      imageUrl: "http://example.com/americano.jpg",
      note: "No sugar",
      variants: [
        { groupId: "g-ice", groupName: "Ice", optionId: "opt-ice", name: "Extra Ice", price: 2000 },
      ],
    },
    {
      id: "item-2",
      productId: "prod-2",
      name: "Croissant",
      sellingPrice: 30000,
      quantity: 1,
      discount: 0,
      tax: 0,
      commission: 0,
      variants: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useOrderStore.setState({
      items: sampleItems as any,
      discount: 5000,
      customerName: "Alice",
      tableNumber: "T-12",
    });
  });

  it("renders order items, summary header, and summary computations accurately", async () => {
    await render(<ListOrder />);

    expect(screen.getByText("Order List")).toBeTruthy();
    expect(screen.getByText("Americano")).toBeTruthy();
    expect(screen.getByText("Croissant")).toBeTruthy();
    expect(screen.getByText("Order Summary")).toBeTruthy();

    // Subtotal: (25000 + 2000) * 2 + 30000 * 1 = 54000 + 30000 = 84000
    expect(screen.getByText(formatCurrency(84000))).toBeTruthy();

    // Total discount: 5000 (global) + 2000 (item) = 7000
    expect(screen.getByText(`- ${formatCurrency(7000)}`)).toBeTruthy();

    // Total tax: 1000 * 1 item with tax = 1000 (or sum of item.tax: 1000 + 0 = 1000)
    expect(screen.getByText(formatCurrency(1000))).toBeTruthy();

    // Total = 84000 - 7000 + 1000 = 78000
    expect(screen.getByText(formatCurrency(78000))).toBeTruthy();
  });

  it("clears order when 'Remove All' button is pressed", async () => {
    await render(<ListOrder />);

    const removeAllBtn = screen.getByText("Remove All");
    await act(async () => {
      fireEvent.press(removeAllBtn);
    });

    expect(useOrderStore.getState().items).toEqual([]);
  });

  it("navigates to discount modal when 'Add Discount' button is pressed", async () => {
    await render(<ListOrder />);

    const addDiscountBtn = screen.getByText("Add Discount");
    await act(async () => {
      fireEvent.press(addDiscountBtn);
    });

    expect(mockRouter.push).toHaveBeenCalledWith("/modal/order/discount");
  });

  it("disables 'Add Discount' button when item list is empty", async () => {
    useOrderStore.setState({ items: [], discount: 0 });
    await render(<ListOrder />);

    const addDiscountBtn = screen.getByText("Add Discount");
    await act(async () => {
      fireEvent.press(addDiscountBtn);
    });

    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("toggles item expansion when an order item is pressed", async () => {
    await render(<ListOrder />);

    // Initially collapsed
    expect(screen.queryByText("Ice: Extra Ice")).toBeNull();

    // Press to expand
    await act(async () => {
      fireEvent.press(screen.getByText("Americano"));
    });
    expect(screen.getByText("Ice: Extra Ice")).toBeTruthy();

    // Press again to collapse
    await act(async () => {
      fireEvent.press(screen.getByText("Americano"));
    });
    expect(screen.queryByText("Ice: Extra Ice")).toBeNull();
  });

  it("navigates to edit item modal with params when Edit is clicked on an expanded item", async () => {
    await render(<ListOrder />);

    // Expand item-1
    await act(async () => {
      fireEvent.press(screen.getByText("Americano"));
    });

    const editBtn = screen.getByText("Edit");
    await act(async () => {
      fireEvent.press(editBtn);
    });

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/modal/order/add-item",
      params: {
        id: "prod-1",
        orderItemId: "item-1",
        name: "Americano",
        sellingPrice: 25000,
        imageUrl: "http://example.com/americano.jpg",
        tax: 1000,
        commission: 500,
        initialQuantity: 2,
        initialNote: "No sugar",
        initialDiscount: 2000,
        initialVariants: JSON.stringify([
          {
            groupId: "g-ice",
            groupName: "Ice",
            optionId: "opt-ice",
            name: "Extra Ice",
            price: 2000,
          },
        ]),
      },
    });
  });

  it("removes item from store when Remove is clicked on an expanded item", async () => {
    await render(<ListOrder />);

    // Expand item-1
    await act(async () => {
      fireEvent.press(screen.getByText("Americano"));
    });

    const removeBtn = screen.getByText("Remove");
    await act(async () => {
      fireEvent.press(removeBtn);
    });

    expect(useOrderStore.getState().items.find((i) => i.id === "item-1")).toBeUndefined();
  });
});
