import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { OrderItem as OrderItemType } from "@/store/useOrderStore";
import { formatCurrency } from "@/utils/Format";
import OrderItem from "../OrderItem";

describe("OrderItem component", () => {
  const baseItem: OrderItemType = {
    id: "order-item-1",
    productId: "prod-1",
    name: "Iced Caramel Latte",
    sellingPrice: 30000,
    quantity: 2,
    discount: 5000,
    tax: 0,
    commission: 0,
    note: "Extra caramel syrup, less ice",
    variants: [
      { groupId: "g-1", groupName: "Size", optionId: "opt-1", name: "Large", price: 5000 },
      { groupId: "g-2", groupName: "Sugar", optionId: "opt-2", name: "Less Sugar", price: 0 },
    ],
  };

  const defaultProps = {
    item: baseItem,
    index: 1,
    isExpanded: false,
    onToggle: jest.fn(),
    onRemove: jest.fn(),
    onEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders collapsed view with item name, quantity, and calculated final price", async () => {
    // Unit price = 30000 + 5000 (variant) = 35000
    // Subtotal = 35000 * 2 = 70000
    // Final price = 70000 - 5000 (discount) = 65000
    await render(<OrderItem {...defaultProps} />);

    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("Iced Caramel Latte")).toBeTruthy();
    expect(screen.getByText(formatCurrency(65000))).toBeTruthy();

    // Expanded details should not be visible
    expect(screen.queryByText("Size: Large")).toBeNull();
    expect(screen.queryByText("Extra caramel syrup, less ice")).toBeNull();
    expect(screen.queryByText("Edit")).toBeNull();
    expect(screen.queryByText("Remove")).toBeNull();
  });

  it("triggers onToggle when header is pressed", async () => {
    await render(<OrderItem {...defaultProps} />);

    await act(async () => {
      fireEvent.press(screen.getByText("Iced Caramel Latte"));
    });

    expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
  });

  it("renders expanded details including variants, notes, discounts, and action buttons", async () => {
    await render(<OrderItem {...defaultProps} isExpanded={true} />);

    // Variants
    expect(screen.getByText("Size: Large")).toBeTruthy();
    expect(screen.getByText(formatCurrency(5000))).toBeTruthy();
    expect(screen.getByText("Sugar: Less Sugar")).toBeTruthy();

    // Note
    expect(screen.getByText("Extra caramel syrup, less ice")).toBeTruthy();

    // Discount
    expect(screen.getByText("Discount")).toBeTruthy();
    expect(screen.getByText(`- ${formatCurrency(5000)}`)).toBeTruthy();

    // Edit and Remove buttons
    expect(screen.getByText("Edit")).toBeTruthy();
    expect(screen.getByText("Remove")).toBeTruthy();
  });

  it("triggers onEdit and onRemove callbacks when action buttons are clicked", async () => {
    await render(<OrderItem {...defaultProps} isExpanded={true} />);

    await act(async () => {
      fireEvent.press(screen.getByText("Edit"));
    });
    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByText("Remove"));
    });
    expect(defaultProps.onRemove).toHaveBeenCalledTimes(1);
  });

  it("renders without variants, notes, or discounts when empty", async () => {
    const simpleItem: OrderItemType = {
      id: "order-item-2",
      productId: "prod-2",
      name: "Espresso",
      sellingPrice: 18000,
      quantity: 1,
      variants: [],
      discount: 0,
    };

    await render(<OrderItem {...defaultProps} isExpanded={true} item={simpleItem} />);

    expect(screen.getByText("Espresso")).toBeTruthy();
    expect(screen.getByText(formatCurrency(18000))).toBeTruthy();
    expect(screen.queryByText("Discount")).toBeNull();
  });

  it("handles fallback values for sellingPrice, quantity, and variant price when not provided", async () => {
    const fallbackItem = {
      id: "order-item-3",
      productId: "prod-3",
      name: "Fallback Item",
      variants: [{ groupName: "Addon", name: "Extra", price: undefined as any }],
    } as any;

    await render(<OrderItem {...defaultProps} isExpanded={false} item={fallbackItem} />);

    expect(screen.getByText("Fallback Item")).toBeTruthy();
  });
});
