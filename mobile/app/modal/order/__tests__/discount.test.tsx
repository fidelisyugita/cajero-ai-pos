import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { t } from "@/services/i18n";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useOrderStore } from "@/store/useOrderStore";
import { formatCurrency } from "@/utils/Format";
import DiscountModal from "../discount";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

describe("DiscountModal", () => {
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
    });
    jest.spyOn(Alert, "alert").mockImplementation(() => {});

    // Seed business store
    useBusinessStore.setState({
      business: {
        id: "store-1",
        name: "Test Store",
        address: "Test Address",
        phone: "12345678",
        email: "store@cajero.com",
        maxDiscount: 20, // 20% max discount
      },
    });

    // Seed order store
    useOrderStore.setState({
      items: [
        {
          id: "item-1",
          productId: "prod-1",
          name: "Coffee",
          sellingPrice: 50000,
          quantity: 2,
          variants: [],
          note: "",
          discount: 0,
          tax: 0,
          commission: 0,
        },
      ],
      discount: 0,
    });
  });

  it("renders with correct max discount hint based on order subtotal and business maxDiscount", async () => {
    // subtotal = 50000 * 2 = 100000. maxDiscount = 20% -> 20000
    await render(<DiscountModal />);

    expect(screen.getByText(t("add_discount"))).toBeTruthy();
    expect(screen.getByText(`${t("max_discount")}: ${formatCurrency(20000)} (20%)`)).toBeTruthy();
  });

  it("prefills input when discount already exists in store", async () => {
    useOrderStore.setState({ discount: 5000 });

    await render(<DiscountModal />);

    const input = screen.getByDisplayValue("5000");
    expect(input).toBeTruthy();
  });

  it("accounts for item-level discounts when calculating max global discount", async () => {
    // subtotal = 100000. maxDiscount = 20% = 20000. item discount = 5000 -> maxAmount = 15000
    useOrderStore.setState({
      items: [
        {
          id: "item-1",
          productId: "prod-1",
          name: "Coffee",
          sellingPrice: 50000,
          quantity: 2,
          variants: [],
          note: "",
          discount: 5000,
          tax: 0,
          commission: 0,
        },
      ],
      discount: 0,
    });

    await render(<DiscountModal />);

    expect(screen.getByText(`${t("max_discount")}: ${formatCurrency(15000)} (20%)`)).toBeTruthy();
  });

  it("updates input when typing valid discount amount within limit", async () => {
    await render(<DiscountModal />);

    const input = screen.getByPlaceholderText("0");
    await act(async () => {
      fireEvent.changeText(input, "15000");
    });

    expect(screen.getByDisplayValue("15000")).toBeTruthy();
  });

  it("does not update input when typed amount exceeds maxAmount", async () => {
    await render(<DiscountModal />);

    const input = screen.getByPlaceholderText("0");
    await act(async () => {
      // 25000 > maxAmount (20000)
      fireEvent.changeText(input, "25000");
    });

    expect(screen.queryByDisplayValue("25000")).toBeNull();
  });

  it("successfully saves valid discount to useOrderStore and navigates back", async () => {
    await render(<DiscountModal />);

    const input = screen.getByPlaceholderText("0");
    await act(async () => {
      fireEvent.changeText(input, "10000");
    });

    const saveButton = screen.getByText(t("save_changes"));
    await act(async () => {
      fireEvent.press(saveButton);
    });

    expect(useOrderStore.getState().discount).toBe(10000);
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("defaults maxDiscountPercent to 10 if business has no maxDiscount specified", async () => {
    useBusinessStore.setState({
      business: null,
    });

    await render(<DiscountModal />);

    // subtotal = 100000. 10% = 10000
    expect(screen.getByText(`${t("max_discount")}: ${formatCurrency(10000)} (10%)`)).toBeTruthy();
  });
});
