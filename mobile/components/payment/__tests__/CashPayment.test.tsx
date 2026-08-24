import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { formatCurrency } from "@/utils/Format";
import CashPayment from "../CashPayment";

describe("CashPayment component", () => {
  const defaultProps = {
    totalAmount: 54000,
    paidAmount: 0,
    onChangePaidAmount: jest.fn(),
    onPay: jest.fn(),
    isProcessing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders header charge label and initial state correctly", async () => {
    await render(<CashPayment {...defaultProps} />);

    expect(screen.getByText(`Charge ${formatCurrency(54000)}`)).toBeTruthy();
    expect(screen.getByText("Paid")).toBeTruthy();
    expect(screen.getByText(formatCurrency(0))).toBeTruthy();
    expect(screen.queryByText("Change")).toBeNull();
  });

  it("renders quick amount suggestions accurately and responds to clicks", async () => {
    // For 54000:
    // next5k = 55000
    // next10k = 60000
    // next50k = 100000
    // suggestions = [54000, 55000, 60000, 100000]
    await render(<CashPayment {...defaultProps} />);

    expect(screen.getByText("Exact")).toBeTruthy();
    expect(screen.getByText(formatCurrency(55000))).toBeTruthy();
    expect(screen.getByText(formatCurrency(60000))).toBeTruthy();
    expect(screen.getByText(formatCurrency(100000))).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByText("Exact"));
    });
    expect(defaultProps.onChangePaidAmount).toHaveBeenCalledWith(54000);

    await act(async () => {
      fireEvent.press(screen.getByText(formatCurrency(55000)));
    });
    expect(defaultProps.onChangePaidAmount).toHaveBeenCalledWith(55000);
  });

  it("renders suggestions for round numbers correctly without duplicates", async () => {
    // For 100000:
    // next5k = 100000 (not > 100000)
    // next10k = 100000 (not > 100000)
    // next50k = 100000 (not > 100000)
    // next100k = 100000 (not > 100000)
    // suggestions = [100000]
    await render(<CashPayment {...defaultProps} totalAmount={100000} />);

    expect(screen.getByText("Exact")).toBeTruthy();
    expect(screen.getByText(`Charge ${formatCurrency(100000)}`)).toBeTruthy();
  });

  it("includes next100k suggestion when applicable", async () => {
    // For 35000:
    // next5k = 35000
    // next10k = 40000
    // next50k = 50000
    // next100k = 100000
    // suggestions = [35000, 40000, 50000, 100000]
    await render(<CashPayment {...defaultProps} totalAmount={35000} />);

    expect(screen.getByText("Exact")).toBeTruthy();
    expect(screen.getByText(formatCurrency(40000))).toBeTruthy();
    expect(screen.getByText(formatCurrency(50000))).toBeTruthy();
    expect(screen.getByText(formatCurrency(100000))).toBeTruthy();
  });

  it("calculates and displays change when paidAmount exceeds totalAmount", async () => {
    await render(<CashPayment {...defaultProps} paidAmount={70000} totalAmount={54000} />);

    expect(screen.getByText("Change")).toBeTruthy();
    expect(screen.getByText(formatCurrency(16000))).toBeTruthy();
  });

  it("handles numpad digit clicks to append numbers", async () => {
    await render(<CashPayment {...defaultProps} paidAmount={0} />);

    await act(async () => {
      fireEvent.press(screen.getByText("5"));
    });
    expect(defaultProps.onChangePaidAmount).toHaveBeenCalledWith(5);
  });

  it("appends digit to an existing non-zero paidAmount", async () => {
    await render(<CashPayment {...defaultProps} paidAmount={50} />);

    await act(async () => {
      fireEvent.press(screen.getByText("0"));
    });
    expect(defaultProps.onChangePaidAmount).toHaveBeenCalledWith(500);
  });

  it("ignores digit append if number length reaches 12 digits", async () => {
    const onChangeMock = jest.fn();
    await render(
      <CashPayment
        {...defaultProps}
        onChangePaidAmount={onChangeMock}
        paidAmount={123456789012} // 12 digits
      />,
    );

    await act(async () => {
      fireEvent.press(screen.getByText("9"));
    });
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it("handles clear ('C') button by resetting paidAmount to 0", async () => {
    await render(<CashPayment {...defaultProps} paidAmount={50000} />);

    await act(async () => {
      fireEvent.press(screen.getByText("C"));
    });
    expect(defaultProps.onChangePaidAmount).toHaveBeenCalledWith(0);
  });

  it("handles backspace ('X') button when paidAmount is multi-digit", async () => {
    const onChangeMock = jest.fn();
    await render(
      <CashPayment {...defaultProps} onChangePaidAmount={onChangeMock} paidAmount={50000} />,
    );

    // Numpad key for backspace renders IcBackspace, find by parent touchable
    // Keys array: [1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0, "X"]
    // "X" is the 12th button in numpad
    const zeroButton = screen.getByText("0");
    const numpadRow = zeroButton.parent?.parent;
    expect(numpadRow).toBeTruthy();

    // Fire press on the last child in the numpad
    const keys = numpadRow?.children;
    const backspaceKey = keys?.[keys.length - 1];
    expect(backspaceKey).toBeTruthy();

    await act(async () => {
      fireEvent.press(backspaceKey as any);
    });

    expect(onChangeMock).toHaveBeenCalledWith(5000);
  });

  it("handles backspace ('X') button when paidAmount is single digit by setting to 0", async () => {
    const onChangeMock = jest.fn();
    await render(
      <CashPayment {...defaultProps} onChangePaidAmount={onChangeMock} paidAmount={7} />,
    );

    const zeroButton = screen.getByText("0");
    const numpadRow = zeroButton.parent?.parent;
    const keys = numpadRow?.children;
    const backspaceKey = keys?.[keys.length - 1];

    await act(async () => {
      fireEvent.press(backspaceKey as any);
    });

    expect(onChangeMock).toHaveBeenCalledWith(0);
  });

  it("disables Pay button when paidAmount is less than totalAmount", async () => {
    await render(<CashPayment {...defaultProps} paidAmount={50000} totalAmount={54000} />);

    const payButton = screen.getByText("Pay");
    await act(async () => {
      fireEvent.press(payButton);
    });

    expect(defaultProps.onPay).not.toHaveBeenCalled();
  });

  it("enables and triggers Pay button when paidAmount is greater than or equal to totalAmount", async () => {
    await render(<CashPayment {...defaultProps} paidAmount={54000} totalAmount={54000} />);

    const payButton = screen.getByText("Pay");
    await act(async () => {
      fireEvent.press(payButton);
    });

    expect(defaultProps.onPay).toHaveBeenCalledTimes(1);
  });

  it("renders with isProcessing true", async () => {
    await render(
      <CashPayment {...defaultProps} isProcessing={true} paidAmount={60000} totalAmount={54000} />,
    );

    expect(screen.getByText("Pay")).toBeTruthy();
  });
});
