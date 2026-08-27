import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import { useCreateUserMutation } from "@/services/mutations/useCreateUserMutation";
import AddEmployeeModal from "../add-employee";

jest.mock("@/services/mutations/useCreateUserMutation", () => ({
  useCreateUserMutation: jest.fn(),
}));

describe("AddEmployeeModal integration", () => {
  const mockCreateUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useCreateUserMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockCreateUser,
      isPending: false,
    });
  });

  it("renders form inputs and cancel/create buttons", async () => {
    await render(<AddEmployeeModal />);

    expect(screen.getByText("Add New Employee")).toBeTruthy();
    expect(screen.getByText("Full Name")).toBeTruthy();
    expect(screen.getByText("Email")).toBeTruthy();
    expect(screen.getByText("Password")).toBeTruthy();
    expect(screen.getByText("Role")).toBeTruthy();
    expect(screen.getByText("Cancel")).toBeTruthy();
    expect(screen.getByText("Create Employee")).toBeTruthy();
  });

  it("navigates back when Cancel is pressed", async () => {
    await render(<AddEmployeeModal />);

    const cancelBtn = screen.getByText("Cancel");
    fireEvent.press(cancelBtn);

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
