import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react-native";
import type React from "react";
import AIChatScreen from "../index";

jest.mock("react-native-keyboard-controller", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    KeyboardAvoidingView: ({ children, ...props }: any) =>
      React.createElement(View, props, children),
  };
});

jest.mock("@/services/endpoints/postAIChat", () => ({
  postAIChat: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("AIChatScreen integration", () => {
  it("renders header and chat interface", async () => {
    await render(<AIChatScreen />, { wrapper: createWrapper() });

    expect(screen.getByText("AI Assistant")).toBeTruthy();
    expect(screen.getByText("Hello! I am your AI assistant.")).toBeTruthy();
    expect(screen.getByPlaceholderText("Type a message...")).toBeTruthy();
  });
});
