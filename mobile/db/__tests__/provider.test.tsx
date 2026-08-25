import { render, renderHook, screen, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { initialize, useMigrationHelper } from "../drizzle";
import { DatabaseProvider, useDatabase } from "../provider";

jest.mock("expo-drizzle-studio-plugin", () => ({
  useDrizzleStudio: jest.fn(),
}));

jest.mock("../drizzle", () => ({
  expoDb: {},
  initialize: jest.fn(),
  useMigrationHelper: jest.fn(),
}));

describe("DatabaseProvider & useDatabase", () => {
  const mockDbInstance = {
    select: jest.fn(),
    insert: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (initialize as jest.Mock).mockResolvedValue(mockDbInstance);
  });

  it("renders migration loading view when migration is in progress (success: false)", async () => {
    (useMigrationHelper as jest.Mock).mockReturnValue({
      success: false,
      error: null,
    });

    await render(
      <DatabaseProvider>
        <Text>Application Ready</Text>
      </DatabaseProvider>,
    );

    expect(screen.getByText("Migrating Database...")).toBeTruthy();
    expect(screen.queryByText("Application Ready")).toBeNull();
  });

  it("renders migration error view when migration fails (error is present)", async () => {
    (useMigrationHelper as jest.Mock).mockReturnValue({
      success: false,
      error: new Error("Disk is full"),
    });

    await render(
      <DatabaseProvider>
        <Text>Application Ready</Text>
      </DatabaseProvider>,
    );

    expect(screen.getByText("Migration Error: Disk is full")).toBeTruthy();
    expect(screen.queryByText("Application Ready")).toBeNull();
  });

  it("initializes database and renders children when migration succeeds (success: true)", async () => {
    (useMigrationHelper as jest.Mock).mockReturnValue({
      success: true,
      error: null,
    });

    await render(
      <DatabaseProvider>
        <Text>Application Ready</Text>
      </DatabaseProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Application Ready")).toBeTruthy();
    });
    expect(initialize).toHaveBeenCalled();
  });

  it("provides initialized db through useDatabase() hook inside DatabaseProvider", async () => {
    (useMigrationHelper as jest.Mock).mockReturnValue({
      success: true,
      error: null,
    });

    const ConsumerComponent = () => {
      const { db } = useDatabase();
      return <Text>{db ? "Database Connected" : "No Database"}</Text>;
    };

    await render(
      <DatabaseProvider>
        <ConsumerComponent />
      </DatabaseProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Database Connected")).toBeTruthy();
    });
  });

  it("returns null db when useDatabase() is used outside of provider", async () => {
    const { result } = await renderHook(() => useDatabase());
    expect(result.current.db).toBeNull();
  });
});
