import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { t } from "@/services/i18n";
import { useCreatePettyCashMutation } from "@/services/mutations/useCreatePettyCashMutation";
import { useUploadImageMutation } from "@/services/mutations/useUploadImageMutation";
import useImageSelectionStore from "@/store/useImageSelectionStore";
import AddExpense from "../add";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  Stack: {
    Screen: ({ options }: any) => {
      if (options?.header) {
        const Header = options.header;
        return <Header />;
      }
      return null;
    },
  },
}));

jest.mock("@/services/mutations/useCreatePettyCashMutation", () => ({
  useCreatePettyCashMutation: jest.fn(),
}));

jest.mock("@/services/mutations/useUploadImageMutation", () => ({
  useUploadImageMutation: jest.fn(),
}));

describe("AddExpense screen", () => {
  const mockBack = jest.fn();
  const mockPush = jest.fn();
  const mockAddExpense = jest.fn();
  const mockUploadImage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
      push: mockPush,
    });

    (useCreatePettyCashMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockAddExpense,
    });

    (useUploadImageMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockUploadImage,
    });

    useImageSelectionStore.setState({
      imageUri: "",
      onImageUploaded: undefined,
    });

    jest.spyOn(Alert, "alert").mockImplementation((_title, _message, buttons) => {
      if (buttons && buttons.length > 0 && buttons[0].onPress) {
        buttons[0].onPress();
      }
    });
  });

  it("renders form fields with default values", async () => {
    await render(<AddExpense />);

    expect(screen.getByText(t("add_expense_title"))).toBeTruthy();
    expect(screen.getByText(t("receipt_image"))).toBeTruthy();
    expect(screen.getByText(new RegExp(t("expense_information")))).toBeTruthy();
    expect(screen.getByText(t("expense"))).toBeTruthy();
    expect(screen.getByText(t("income"))).toBeTruthy();
    expect(screen.getByText(t("save"))).toBeTruthy();
  });

  it("navigates to upload image modal when Upload button is pressed", async () => {
    await render(<AddExpense />);

    const uploadButton = screen.getByText(t("upload"));
    await act(async () => {
      fireEvent.press(uploadButton);
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/modal/product/upload-image",
      params: { title: "Receipt / Image" },
    });
    expect(typeof useImageSelectionStore.getState().onImageUploaded).toBe("function");
  });

  it("validates required description and amount fields on submit", async () => {
    await render(<AddExpense />);

    const saveButton = screen.getByText(t("save"));
    await act(async () => {
      fireEvent.press(saveButton);
    });

    await waitFor(() => {
      expect(mockAddExpense).not.toHaveBeenCalled();
    });
  });

  it("toggles transaction type between Expense and Income", async () => {
    await render(<AddExpense />);

    const switchComponent = screen.getByRole("switch");
    expect(switchComponent).toBeTruthy();

    await act(async () => {
      fireEvent(switchComponent, "valueChange", true);
    });

    const descInput = screen.getByPlaceholderText(t("description_required"));
    const amountInput = screen.getByPlaceholderText(t("amount_required"));
    await act(async () => {
      fireEvent.changeText(descInput, "Sales Return Income");
      fireEvent.changeText(amountInput, "75000");
    });

    mockAddExpense.mockResolvedValueOnce({ id: "exp-1" });

    const saveButton = screen.getByText(t("save"));
    await act(async () => {
      fireEvent.press(saveButton);
    });

    await waitFor(() => {
      expect(mockAddExpense).toHaveBeenCalledWith({
        description: "Sales Return Income",
        amount: 75000,
        isIncome: true,
        imageUrl: undefined,
      });
      expect(Alert.alert).toHaveBeenCalledWith(
        t("success"),
        t("expense_added_success"),
        expect.any(Array),
      );
    });

    expect(mockBack).toHaveBeenCalled();
  });

  it("uploads local image before saving expense if local image is present", async () => {
    mockUploadImage.mockResolvedValueOnce("https://cdn.cajero.com/receipt.jpg");
    mockAddExpense.mockResolvedValueOnce({ id: "exp-2" });

    await render(<AddExpense />);

    // Simulate image selection callback setup
    await act(async () => {
      fireEvent.press(screen.getByText(t("upload")));
    });

    await act(async () => {
      useImageSelectionStore.getState().onImageUploaded?.("file:///local/receipt.png");
    });

    const descInput = screen.getByPlaceholderText(t("description_required"));
    const amountInput = screen.getByPlaceholderText(t("amount_required"));
    await act(async () => {
      fireEvent.changeText(descInput, "Office Supplies");
      fireEvent.changeText(amountInput, "120000");
    });

    const saveButton = screen.getByText(t("save"));
    await act(async () => {
      fireEvent.press(saveButton);
    });

    await waitFor(() => {
      expect(mockUploadImage).toHaveBeenCalledWith({
        fileUri: "file:///local/receipt.png",
        type: "petty-cash",
      });
      expect(mockAddExpense).toHaveBeenCalledWith({
        description: "Office Supplies",
        amount: 120000,
        isIncome: false,
        imageUrl: "https://cdn.cajero.com/receipt.jpg",
      });
      expect(Alert.alert).toHaveBeenCalledWith(
        t("success"),
        t("expense_added_success"),
        expect.any(Array),
      );
    });
  });

  it("handles mutation error gracefully with alert", async () => {
    mockAddExpense.mockRejectedValueOnce(new Error("Network connection error"));

    await render(<AddExpense />);

    const descInput = screen.getByPlaceholderText(t("description_required"));
    const amountInput = screen.getByPlaceholderText(t("amount_required"));
    await act(async () => {
      fireEvent.changeText(descInput, "Coffee Beans Purchase");
      fireEvent.changeText(amountInput, "50000");
    });

    const saveButton = screen.getByText(t("save"));
    await act(async () => {
      fireEvent.press(saveButton);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(t("failed"), "Network connection error");
    });
  });
});
