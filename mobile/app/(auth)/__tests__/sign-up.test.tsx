import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import type React from "react";
import SignUpScreen from "../sign-up";

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

describe("SignUpScreen integration", () => {
  it("renders sign up screen with form and sign in navigation button", async () => {
    await render(<SignUpScreen />, { wrapper: createWrapper() });

    expect(screen.getAllByText("Sign Up").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sign In").length).toBeGreaterThan(0);

    const signInBtn = screen.getAllByText("Sign In")[0];
    fireEvent.press(signInBtn);

    expect(router.replace).toHaveBeenCalledWith("/(auth)/sign-in");
  });
});
