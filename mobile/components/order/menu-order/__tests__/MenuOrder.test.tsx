import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { mockRouter } from "@/jest.setup";
import { useOrderStore } from "@/store/useOrderStore";
import { formatFullDate } from "@/utils/Date";
import MenuOrder from "../MenuOrder";

describe("MenuOrder component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useOrderStore.setState({
      items: [],
      customerName: "",
      tableNumber: "",
      discount: 0,
    });
  });

  it("renders header with current date and localized title", async () => {
    await render(<MenuOrder />);

    const today = formatFullDate();
    expect(screen.getByText("Current Order")).toBeTruthy();
    expect(screen.getByText(today)).toBeTruthy();
  });

  it("binds customer name input changes to useOrderStore", async () => {
    await render(<MenuOrder />);

    const customerInput = screen.getByPlaceholderText("Customer Name");
    await act(async () => {
      fireEvent.changeText(customerInput, "John Doe");
    });

    expect(useOrderStore.getState().customerName).toBe("John Doe");
  });

  it("binds table number numeric input changes to useOrderStore", async () => {
    useOrderStore.setState({ tableNumber: "5" });
    await render(<MenuOrder />);

    const tableInput = screen.getByDisplayValue("5");
    await act(async () => {
      fireEvent.changeText(tableInput, "12");
    });

    expect(useOrderStore.getState().tableNumber).toBe("12");
  });

  it("disables the proceed button when there are no items in cart", async () => {
    useOrderStore.setState({ items: [] });
    await render(<MenuOrder />);

    const proceedBtn = screen.getByText("Proceed");
    await act(async () => {
      fireEvent.press(proceedBtn);
    });

    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("enables the proceed button and navigates to /payment when items exist in cart", async () => {
    useOrderStore.setState({
      items: [
        {
          id: "item-1",
          productId: "prod-1",
          name: "Espresso",
          sellingPrice: 20000,
          quantity: 1,
          variants: [],
        },
      ],
      customerName: "Jane",
      tableNumber: "3",
    });

    await render(<MenuOrder />);

    const proceedBtn = screen.getByText("Proceed");
    await act(async () => {
      fireEvent.press(proceedBtn);
    });

    expect(mockRouter.push).toHaveBeenCalledWith("/payment");
  });
});
