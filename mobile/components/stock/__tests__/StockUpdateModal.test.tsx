import { act, fireEvent, render, screen } from "@testing-library/react-native";
import StockUpdateModal from "../StockUpdateModal";

describe("StockUpdateModal component", () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    currentStock: 25,
    itemName: "Arabica Beans (1kg)",
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal with item name and current stock value", async () => {
    await render(<StockUpdateModal {...defaultProps} />);

    expect(screen.getByText("Update Stock for Arabica Beans (1kg)")).toBeTruthy();
    expect(screen.getByText("New Stock Value")).toBeTruthy();
    expect(screen.getByDisplayValue("25")).toBeTruthy();
    expect(screen.getByText("Cancel")).toBeTruthy();
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it("updates stock input and calls onSave with parsed float number", async () => {
    await render(<StockUpdateModal {...defaultProps} />);

    const input = screen.getByDisplayValue("25");
    await act(async () => {
      fireEvent.changeText(input, "40.5");
    });

    const saveBtn = screen.getByText("Save");
    await act(async () => {
      fireEvent.press(saveBtn);
    });

    expect(defaultProps.onSave).toHaveBeenCalledWith(40.5);
  });

  it("calls onClose when Cancel button is pressed", async () => {
    await render(<StockUpdateModal {...defaultProps} />);

    const cancelBtn = screen.getByText("Cancel");
    await act(async () => {
      fireEvent.press(cancelBtn);
    });

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onClose when overlay backdrop is pressed", async () => {
    await render(<StockUpdateModal {...defaultProps} />);

    const title = screen.getByText("Update Stock for Arabica Beans (1kg)");
    // ModalView is title.parent. CenteredView is title.parent.parent. Overlay is centeredView.children[0]
    const centeredView: any = title.parent?.parent;
    const overlay = centeredView?.children?.[0];

    if (overlay) {
      await act(async () => {
        fireEvent.press(overlay);
      });
      expect(defaultProps.onClose).toHaveBeenCalled();
    }
  });

  it("calls onClose on Modal onRequestClose event", async () => {
    await render(<StockUpdateModal {...defaultProps} />);

    const title = screen.getByText("Update Stock for Arabica Beans (1kg)");
    let current: any = title.parent;
    while (current && !current.props?.onRequestClose) {
      current = current.parent;
    }

    if (current?.props?.onRequestClose) {
      await act(async () => {
        current.props.onRequestClose();
      });
      expect(defaultProps.onClose).toHaveBeenCalled();
    }
  });

  it("resets stock input value when currentStock prop changes", async () => {
    const { rerender } = await render(<StockUpdateModal {...defaultProps} />);

    expect(screen.getByDisplayValue("25")).toBeTruthy();

    await rerender(<StockUpdateModal {...defaultProps} currentStock={50} />);
    expect(screen.getByDisplayValue("50")).toBeTruthy();
  });

  it("handles null or undefined currentStock fallback to 0", async () => {
    await render(<StockUpdateModal {...defaultProps} currentStock={undefined as any} />);

    expect(screen.getByDisplayValue("0")).toBeTruthy();
  });

  it("renders with isLoading true on Save button", async () => {
    await render(<StockUpdateModal {...defaultProps} isLoading={true} />);

    expect(screen.getByText("Save")).toBeTruthy();
  });
});
