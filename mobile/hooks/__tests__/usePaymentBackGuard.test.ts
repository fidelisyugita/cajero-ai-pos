import { renderHook } from "@testing-library/react-native";
import { Alert, BackHandler } from "react-native";
import { usePaymentBackGuard } from "../usePaymentBackGuard";

describe("usePaymentBackGuard", () => {
  let backHandlerCallback: ((...args: any[]) => boolean | null | undefined) | null = null;
  const mockRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    jest.spyOn(BackHandler, "addEventListener").mockImplementation((_event, callback) => {
      backHandlerCallback = callback;
      return { remove: mockRemove };
    });
  });

  afterEach(() => {
    backHandlerCallback = null;
  });

  it("blocks hardware back when payment transaction is pending", async () => {
    await renderHook(() =>
      usePaymentBackGuard({
        isPending: true,
        isSuccess: false,
        hasActiveItems: true,
        onNewTransaction: jest.fn(),
        onExit: jest.fn(),
      }),
    );

    expect(backHandlerCallback).toBeDefined();
    const result = backHandlerCallback?.();
    expect(result).toBe(true);
  });

  it("triggers onNewTransaction and blocks default back when payment is successful", async () => {
    const onNewTransaction = jest.fn();
    await renderHook(() =>
      usePaymentBackGuard({
        isPending: false,
        isSuccess: true,
        hasActiveItems: false,
        onNewTransaction,
        onExit: jest.fn(),
      }),
    );

    const result = backHandlerCallback?.();
    expect(result).toBe(true);
    expect(onNewTransaction).toHaveBeenCalledTimes(1);
  });

  it("shows confirmation dialog when items exist in checkout", async () => {
    const onExit = jest.fn();
    await renderHook(() =>
      usePaymentBackGuard({
        isPending: false,
        isSuccess: false,
        hasActiveItems: true,
        onNewTransaction: jest.fn(),
        onExit,
      }),
    );

    const result = backHandlerCallback?.();
    expect(result).toBe(true);
    expect(Alert.alert).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.arrayContaining([
        expect.objectContaining({ text: expect.any(String), style: "cancel" }),
        expect.objectContaining({ text: expect.any(String), style: "destructive" }),
      ]),
    );
  });

  it("allows standard back navigation when no items and not in transaction", async () => {
    await renderHook(() =>
      usePaymentBackGuard({
        isPending: false,
        isSuccess: false,
        hasActiveItems: false,
        onNewTransaction: jest.fn(),
        onExit: jest.fn(),
      }),
    );

    const result = backHandlerCallback?.();
    expect(result).toBe(false);
  });

  it("removes event listener on unmount", async () => {
    const { unmount } = await renderHook(() =>
      usePaymentBackGuard({
        isPending: false,
        isSuccess: false,
        hasActiveItems: false,
        onNewTransaction: jest.fn(),
        onExit: jest.fn(),
      }),
    );

    await unmount();
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });
});
