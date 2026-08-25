import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react-native";
import type React from "react";
import SignInScreen from "../sign-in";

jest.mock("@/services/endpoints/getStore", () => ({
  getStore: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("SignInScreen integration", () => {
  it("renders auth layout and sign in form elements", async () => {
    await render(<SignInScreen />, { wrapper: createWrapper() });

    expect(screen.getAllByText("Sign In").length).toBeGreaterThan(0);
    expect(screen.getByTestId("email-input")).toBeTruthy();
    expect(screen.getByTestId("password-input")).toBeTruthy();
  });
});
