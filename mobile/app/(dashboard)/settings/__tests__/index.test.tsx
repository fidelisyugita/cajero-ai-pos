import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type React from "react";
import SettingsScreen from "../index";

jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    closeSync: jest.fn(),
  })),
}));

jest.mock("drizzle-orm/expo-sqlite", () => ({
  drizzle: jest.fn(() => ({
    $client: {
      close: jest.fn(),
    },
  })),
}));

jest.mock("expo-file-system", () => ({
  documentDirectory: "/mock/document/directory/",
  deleteAsync: jest.fn(),
}));

jest.mock("@/services/PrinterService", () => ({
  printerService: {
    scanDevices: jest.fn(),
    stopScan: jest.fn(),
    connectToDevice: jest.fn(),
    disconnect: jest.fn(),
    printReceipt: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("SettingsScreen integration", () => {
  it("renders settings screen and switches between tabs", async () => {
    await render(<SettingsScreen />, { wrapper: createWrapper() });

    expect(screen.getByText("Settings")).toBeTruthy();
    expect(screen.getByText("Printers")).toBeTruthy();

    const langTab = screen.getByText("Language");
    await act(async () => {
      fireEvent.press(langTab);
    });

    expect(screen.getByText("Language Setting")).toBeTruthy();
    expect(screen.getByText("English")).toBeTruthy();
    expect(screen.getByText("Indonesian")).toBeTruthy();
  });
});
