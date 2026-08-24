import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import SignUpForm from "../SignUpForm";

describe("SignUpForm component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form inputs and action buttons correctly", async () => {
    await render(<SignUpForm />);

    expect(screen.getByPlaceholderText("Full Name")).toBeTruthy();
    expect(screen.getByPlaceholderText("Email")).toBeTruthy();
    expect(screen.getByPlaceholderText("Password")).toBeTruthy();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeTruthy();
    expect(screen.getByText("Sign Up")).toBeTruthy();
    expect(screen.getByText("Sign Up with Google")).toBeTruthy();
  });

  it("shows validation error messages when submitting empty form", async () => {
    await render(<SignUpForm />);

    const submitBtn = screen.getByText("Sign Up");
    await act(async () => {
      fireEvent.press(submitBtn);
    });

    await waitFor(() => {
      expect(screen.getByText("Full name is required")).toBeTruthy();
      expect(screen.getByText("Email is required")).toBeTruthy();
      expect(screen.getByText("Password is required")).toBeTruthy();
      expect(screen.getByText("Confirm password is required")).toBeTruthy();
    });
  });

  it("shows validation errors for invalid email, short password, and mismatched confirm password", async () => {
    await render(<SignUpForm />);

    const fullNameInput = screen.getByPlaceholderText("Full Name");
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password");
    const submitBtn = screen.getByText("Sign Up");

    await act(async () => {
      fireEvent.changeText(fullNameInput, "Jane Doe");
      fireEvent.changeText(emailInput, "bad-email");
      fireEvent.changeText(passwordInput, "123");
      fireEvent.changeText(confirmPasswordInput, "456");
      fireEvent.press(submitBtn);
    });

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeTruthy();
      expect(screen.getByText("Password must be at least 6 characters")).toBeTruthy();
    });
  });

  it("shows validation error when passwords do not match", async () => {
    await render(<SignUpForm />);

    const fullNameInput = screen.getByPlaceholderText("Full Name");
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password");
    const submitBtn = screen.getByText("Sign Up");

    await act(async () => {
      fireEvent.changeText(fullNameInput, "Jane Doe");
      fireEvent.changeText(emailInput, "jane@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.changeText(confirmPasswordInput, "password456");
      fireEvent.press(submitBtn);
    });

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeTruthy();
    });
  });

  it("toggles password and confirm password visibility when eye icons are clicked", async () => {
    await render(<SignUpForm />);

    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password");

    expect(passwordInput.props.secureTextEntry).toBe(true);
    expect(confirmPasswordInput.props.secureTextEntry).toBe(true);

    const svgIcons = screen.getAllByTestId("svg-mock");
    // svgIcons[0] is password eye, svgIcons[1] is confirmPassword eye
    if (svgIcons.length >= 2) {
      await act(async () => {
        fireEvent.press(svgIcons[0]);
        fireEvent.press(svgIcons[1]);
      });

      expect(passwordInput.props.secureTextEntry).toBe(false);
      expect(confirmPasswordInput.props.secureTextEntry).toBe(false);
    }
  });

  it("handles field focus chaining via onSubmitEditing", async () => {
    await render(<SignUpForm />);

    const fullNameInput = screen.getByPlaceholderText("Full Name");
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");

    await act(async () => {
      fireEvent(fullNameInput, "submitEditing");
      fireEvent(emailInput, "submitEditing");
      fireEvent(passwordInput, "submitEditing");
    });
  });

  it("handles valid form submission and Google sign up click", async () => {
    await render(<SignUpForm />);

    const fullNameInput = screen.getByPlaceholderText("Full Name");
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password");
    const submitBtn = screen.getByText("Sign Up");
    const googleBtn = screen.getByText("Sign Up with Google");

    await act(async () => {
      fireEvent.changeText(fullNameInput, "Jane Doe");
      fireEvent.changeText(emailInput, "jane@example.com");
      fireEvent.changeText(passwordInput, "password123");
      fireEvent.changeText(confirmPasswordInput, "password123");
      fireEvent.press(submitBtn);
      fireEvent.press(googleBtn);
    });

    await waitFor(() => {
      expect(screen.queryByText("Passwords do not match")).toBeNull();
      expect(screen.queryByText("Invalid email address")).toBeNull();
    });
  });
});
