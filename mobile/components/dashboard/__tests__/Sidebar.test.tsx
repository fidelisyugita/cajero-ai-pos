import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { usePathname, useRouter } from "expo-router";
import { Alert } from "react-native";
import { SyncService } from "@/services/SyncService";
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
  },
}));

jest.mock("@/services/SyncService", () => ({
  SyncService: {
    getUnsyncedCount: jest.fn(),
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
    (SyncService.getUnsyncedCount as jest.Mock).mockResolvedValue(0);

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

  it("prompts sign out alert when Sign Out is pressed", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    await render(<Sidebar />);

    const signOutBtn = screen.getByText("Sign Out");
    await act(async () => {
      fireEvent.press(signOutBtn);
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Sign Out",
      "Are you sure you want to sign out?",
      expect.any(Array),
    );
  });
});
