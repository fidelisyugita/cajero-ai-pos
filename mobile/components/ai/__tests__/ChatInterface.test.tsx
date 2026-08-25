import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { postAIChat } from "@/services/endpoints/postAIChat";
import { useLanguageStore } from "@/store/useLanguageStore";
import ChatInterface from "../ChatInterface";

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

describe("ChatInterface component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLanguageStore.setState({ language: "en" });
  });

  it("renders welcome message and input bar", async () => {
    await render(<ChatInterface />);

    expect(screen.getByText("Hello! I am your AI assistant.")).toBeTruthy();
    expect(screen.getByPlaceholderText("Type a message...")).toBeTruthy();
  });

  it("sends message and displays AI assistant response", async () => {
    (postAIChat as jest.Mock).mockResolvedValue({
      text: "Total sales today are Rp 1.500.000 across 25 transactions.",
    });

    await render(<ChatInterface />);

    const input = screen.getByPlaceholderText("Type a message...");
    await act(async () => {
      fireEvent.changeText(input, "What are today's total sales?");
    });
    await act(async () => {
      fireEvent(input, "submitEditing");
    });

    expect(postAIChat).toHaveBeenCalledWith("What are today's total sales?");
    expect(
      await screen.findByText("Total sales today are Rp 1.500.000 across 25 transactions."),
    ).toBeTruthy();
  });

  it("displays connection error message when postAIChat fails", async () => {
    (postAIChat as jest.Mock).mockRejectedValue(new Error("Network failed"));

    await render(<ChatInterface />);

    const input = screen.getByPlaceholderText("Type a message...");
    await act(async () => {
      fireEvent.changeText(input, "How is inventory?");
    });
    await act(async () => {
      fireEvent(input, "submitEditing");
    });

    expect(
      await screen.findByText("Error: Could not connect to AI server. Please try again."),
    ).toBeTruthy();
  });
});
