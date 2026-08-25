import { render, screen } from "@testing-library/react-native";
import { useBusinessStore } from "@/store/useBusinessStore";
import AISettings from "../AISettings";

describe("AISettings component", () => {
  beforeEach(() => {
    useBusinessStore.setState({
      business: undefined,
    });
  });

  it("renders 'Coming Soon' upgrade prompt when subscription is not ultra", async () => {
    useBusinessStore.setState({
      business: { subscriptionStatus: "free" } as any,
    });

    await render(<AISettings />);

    expect(screen.getByText("Coming Soon")).toBeTruthy();
    expect(
      screen.getByText(
        "Unlock AI capabilities to get smart insights and assistance directly on your device.",
      ),
    ).toBeTruthy();
  });

  it("renders active AI assistant status when subscription is ultra", async () => {
    useBusinessStore.setState({
      business: { subscriptionStatus: "ultra" } as any,
    });

    await render(<AISettings />);

    expect(screen.getByText("AI Online Active")).toBeTruthy();
    expect(
      screen.getByText(
        "Your AI assistant is now powered by cloud (Groq). Fast, powerful, and no downloads required.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Model: Llama 3 8B (Online)")).toBeTruthy();
  });
});
