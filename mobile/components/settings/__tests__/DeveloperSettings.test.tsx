import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";
import DeveloperSettings from "../DeveloperSettings";

jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    closeSync: jest.fn(),
  })),
}));

jest.mock("drizzle-orm/expo-sqlite", () => ({
  drizzle: jest.fn((_client) => ({
    $client: {
      close: jest.fn(),
    },
  })),
}));

jest.mock("expo-file-system/legacy", () => ({
  documentDirectory: "/mock/document/directory/",
  deleteAsync: jest.fn(),
}));

describe("DeveloperSettings component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders developer options and reset database button", async () => {
    await render(<DeveloperSettings />);

    expect(screen.getByText("Developer Options")).toBeTruthy();
    expect(screen.getByText("Database")).toBeTruthy();
    expect(screen.getByText("Reset Database")).toBeTruthy();
  });

  it("prompts confirmation alert when Reset Database is clicked", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    await render(<DeveloperSettings />);

    const resetBtn = screen.getByText("Reset Database");
    await act(async () => {
      fireEvent.press(resetBtn);
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Reset Database",
      "Are you sure you want to reset the database? All local data will be lost.",
      expect.any(Array),
    );
  });
});
