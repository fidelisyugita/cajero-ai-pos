import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { usePathname, useRouter } from "expo-router";
import { useSyncExternalStore } from "react";
import { LogoutService } from "@/services/LogoutService";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import Sidebar from "../Sidebar";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock("@/services/LogoutService", () => ({
  LogoutService: {
    performLogout: jest.fn(),
    performSafeLogout: jest.fn(),
  },
}));

describe("Sidebar component", () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });
    (usePathname as jest.Mock).mockReturnValue("/menu");

    useAuthStore.setState({
      user: { roleCode: "OWNER" } as any,
    });
    useBusinessStore.setState({
      business: { subscriptionStatus: "ultra" } as any,
    });
  });

  it("renders navigation items (Menu, Stock, Report, Assistant, etc.)", async () => {
    await render(<Sidebar />);

    expect(screen.getByText("Menu")).toBeTruthy();
    expect(screen.getByText("Stock")).toBeTruthy();
    expect(screen.getByText("Report")).toBeTruthy();
    expect(screen.getByText("Assistant")).toBeTruthy();
    expect(screen.getByText("Sign Out")).toBeTruthy();
  });

  it("navigates when an item is pressed", async () => {
    await render(<Sidebar />);

    const stockBtn = screen.getByText("Stock");
    fireEvent.press(stockBtn);

    expect(mockReplace).toHaveBeenCalledWith("/(dashboard)/stock");
  });

  it("calls LogoutService.performSafeLogout when Sign Out is pressed", async () => {
    await render(<Sidebar />);

    const signOutBtn = screen.getByText("Sign Out");
    fireEvent.press(signOutBtn);

    expect(LogoutService.performSafeLogout).toHaveBeenCalledTimes(1);
  });

  it("updates active tab on pathname change", async () => {
    let currentPath = "/menu";
    const listeners = new Set<() => void>();
    (usePathname as jest.Mock).mockImplementation(() =>
      useSyncExternalStore(
        (listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        () => currentPath,
      ),
    );

    await render(<Sidebar />);

    fireEvent.press(screen.getByText("Menu"));
    expect(mockReplace).not.toHaveBeenCalled();

    await act(async () => {
      currentPath = "/stock";
      for (const listener of listeners) listener();
    });

    fireEvent.press(screen.getByText("Stock"));
    expect(mockReplace).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText("Menu"));
    expect(mockReplace).toHaveBeenCalledWith("/(dashboard)/menu");
  });
});
