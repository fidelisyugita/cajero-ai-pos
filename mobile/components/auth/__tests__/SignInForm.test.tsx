import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { mockRouter } from "@/jest.setup";
import alertService from "@/services/AlertService";
import { getStore } from "@/services/endpoints/getStore";
import * as useSignInMutationModule from "@/services/mutations/useSignInMutation";
import type { AuthUser } from "@/services/types/Auth";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useLoadingStore } from "@/store/useLoadingStore";
import SignInForm from "../SignInForm";

jest.mock("@/services/endpoints/getStore", () => ({
  getStore: jest.fn(),
}));

jest.mock("@/services/AlertService", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
    show: jest.fn(),
  },
}));

describe("SignInForm component", () => {
  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: undefined, isLoggedIn: false });
    useBusinessStore.setState({ business: null });
    useLoadingStore.setState({ isLoading: false });

    jest.spyOn(useSignInMutationModule, "useSignInOwnerMutation").mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as unknown as ReturnType<typeof useSignInMutationModule.useSignInOwnerMutation>);

    (getStore as jest.Mock).mockResolvedValue({
      id: "store-123",
      name: "Cajero Cafe",
    });
  });

  it("renders email and password inputs and submit button", async () => {
    await render(<SignInForm />);

    expect(screen.getByTestId("email-input")).toBeTruthy();
    expect(screen.getByTestId("password-input")).toBeTruthy();
    expect(screen.getByTestId("sign-in-button")).toBeTruthy();
  });

  it("handles onSubmitEditing on email input", async () => {
    await render(<SignInForm />);

    const emailInput = screen.getByTestId("email-input");
    await act(async () => {
      fireEvent(emailInput, "submitEditing");
    });
  });

  it("shows validation error messages when submitting empty form", async () => {
    await render(<SignInForm />);

    const submitBtn = screen.getByTestId("sign-in-button");
    await act(async () => {
      fireEvent.press(submitBtn);
    });

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeTruthy();
      expect(screen.getByText("Password is required")).toBeTruthy();
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("shows validation error on invalid email and short password", async () => {
    await render(<SignInForm />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitBtn = screen.getByTestId("sign-in-button");

    await act(async () => {
      fireEvent.changeText(emailInput, "not-an-email");
      fireEvent.changeText(passwordInput, "123");
      fireEvent.press(submitBtn);
    });

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeTruthy();
      expect(screen.getByText("Password must be at least 6 characters")).toBeTruthy();
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("toggles password visibility when eye icon is clicked", async () => {
    await render(<SignInForm />);

    const passwordInput = screen.getByTestId("password-input");
    expect(passwordInput.props.secureTextEntry).toBe(true);

    const svgIcon = screen.getByTestId("svg-mock");
    await act(async () => {
      fireEvent.press(svgIcon);
    });

    expect(passwordInput.props.secureTextEntry).toBe(false);
  });

  it("handles successful sign in with store fetch and dashboard navigation", async () => {
    const mockUser: AuthUser = {
      id: "user-1",
      email: "owner@cajero.app",
      name: "Owner User",
      phone: null,
      storeId: "store-123",
      roleCode: "OWNER",
      imageUrl: null,
      accessToken: "mock-token",
      refreshToken: "mock-refresh-token",
      createdAt: null,
      updatedAt: null,
    };
    mockMutateAsync.mockResolvedValueOnce(mockUser);

    await render(<SignInForm />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitBtn = screen.getByTestId("sign-in-button");

    await act(async () => {
      fireEvent.changeText(emailInput, "owner@cajero.app");
      fireEvent.changeText(passwordInput, "secret123");
      fireEvent.press(submitBtn);
    });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: "owner@cajero.app",
        password: "secret123",
      });
      expect(useAuthStore.getState().isLoggedIn).toBe(true);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useBusinessStore.getState().business).toEqual({
        id: "store-123",
        name: "Cajero Cafe",
      });
      expect(mockRouter.replace).toHaveBeenCalledWith("/(dashboard)");
    });
  });

  it("handles successful sign in when user has no storeId", async () => {
    const mockUserWithoutStore: AuthUser = {
      id: "user-2",
      email: "nostore@cajero.app",
      name: "New Owner",
      phone: null,
      storeId: "",
      roleCode: "OWNER",
      imageUrl: null,
      accessToken: "mock-token",
      refreshToken: "mock-refresh-token",
      createdAt: null,
      updatedAt: null,
    };
    mockMutateAsync.mockResolvedValueOnce(mockUserWithoutStore);

    await render(<SignInForm />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitBtn = screen.getByTestId("sign-in-button");

    await act(async () => {
      fireEvent.changeText(emailInput, "nostore@cajero.app");
      fireEvent.changeText(passwordInput, "secret123");
      fireEvent.press(submitBtn);
    });

    await waitFor(() => {
      expect(useAuthStore.getState().isLoggedIn).toBe(true);
      expect(mockRouter.replace).toHaveBeenCalledWith("/(dashboard)");
    });
  });

  it("handles sign in failure by alerting error and hiding loading", async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error("Invalid credentials"));

    await render(<SignInForm />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitBtn = screen.getByTestId("sign-in-button");

    await act(async () => {
      fireEvent.changeText(emailInput, "wrong@cajero.app");
      fireEvent.changeText(passwordInput, "wrongpass");
      fireEvent.press(submitBtn);
    });

    await waitFor(() => {
      expect(alertService.error).toHaveBeenCalledWith(
        "Sign In Failed",
        "Incorrect email or password. Please try again.",
      );
      expect(useLoadingStore.getState().isLoading).toBe(false);
      expect(useAuthStore.getState().isLoggedIn).toBe(false);
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });
});
