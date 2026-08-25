import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Text, View } from "react-native";
import { captureSentryException } from "@/lib/sentry";
import { useLanguageStore } from "@/store/useLanguageStore";
import PosErrorBoundary from "../PosErrorBoundary";

jest.mock("@/lib/sentry", () => ({
  captureSentryException: jest.fn(),
}));

const BrokenComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Simulated Cart Rendering Crash");
  }
  return (
    <View testID="healthy-pos-view">
      <Text>Active POS Register</Text>
    </View>
  );
};

describe("PosErrorBoundary component", () => {
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });
  beforeEach(() => {
    jest.clearAllMocks();
    useLanguageStore.setState({ language: "id" });
  });

  it("renders children normally when no error is thrown", async () => {
    await render(
      <PosErrorBoundary>
        <BrokenComponent shouldThrow={false} />
      </PosErrorBoundary>,
    );

    expect(screen.getByTestId("healthy-pos-view")).toBeTruthy();
    expect(screen.getByText("Active POS Register")).toBeTruthy();
    expect(captureSentryException).not.toHaveBeenCalled();
  });

  it("catches error in children, reports to Sentry, and renders localized EmptyState (Indonesian)", async () => {
    const onErrorMock = jest.fn();

    await render(
      <PosErrorBoundary onError={onErrorMock}>
        <BrokenComponent shouldThrow={true} />
      </PosErrorBoundary>,
    );

    expect(screen.getByTestId("pos-error-boundary-fallback")).toBeTruthy();
    expect(screen.getByText("Kendala Sistem Kasir")).toBeTruthy();
    expect(
      screen.getByText(
        "Terjadi kendala teknis pada tampilan kasir. Data transaksi dan keranjang belanja Anda tetap aman.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Pulihkan Layar Kasir")).toBeTruthy();
    expect(screen.getByText("Diagnostic: Simulated Cart Rendering Crash")).toBeTruthy();
    expect(captureSentryException).toHaveBeenCalledTimes(1);
    expect(onErrorMock).toHaveBeenCalledTimes(1);
  });

  it("renders English translations when language is set to 'en'", async () => {
    useLanguageStore.setState({ language: "en" });

    await render(
      <PosErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </PosErrorBoundary>,
    );

    expect(screen.getByText("POS System Alert")).toBeTruthy();
    expect(
      screen.getByText(
        "An unexpected issue occurred on the cashier display. Your active transaction and cart data remain safe.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Recover POS Screen")).toBeTruthy();
  });

  it("handles cashier recovery action when clicking recover button", async () => {
    const onRecoverMock = jest.fn();

    await render(
      <PosErrorBoundary onRecover={onRecoverMock}>
        <BrokenComponent shouldThrow={true} />
      </PosErrorBoundary>,
    );

    const recoverButton = screen.getByText("Pulihkan Layar Kasir");
    await act(async () => {
      fireEvent.press(recoverButton);
    });

    expect(onRecoverMock).toHaveBeenCalledTimes(1);
  });

  it("renders custom fallback when provided", async () => {
    const customFallback = (error: Error, _reset: () => void) => (
      <View testID="custom-fallback">
        <Text>Custom error: {error.message}</Text>
      </View>
    );

    await render(
      <PosErrorBoundary fallback={customFallback}>
        <BrokenComponent shouldThrow={true} />
      </PosErrorBoundary>,
    );

    expect(screen.getByTestId("custom-fallback")).toBeTruthy();
    expect(screen.getByText("Custom error: Simulated Cart Rendering Crash")).toBeTruthy();
  });
});
