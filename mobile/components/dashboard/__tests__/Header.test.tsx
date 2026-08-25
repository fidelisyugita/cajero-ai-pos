import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { useReferenceStore } from "@/store/useReferenceStore";
import Header from "../Header";

describe("Header component", () => {
  const mockFetchAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useReferenceStore.setState({
      transactionTypes: [],
      paymentMethods: [],
      transactionStatuses: [],
      fetchAll: mockFetchAll,
    });
    useAuthStore.setState({
      user: {
        id: "u-1",
        name: "Alice Cooper",
        roleCode: "MANAGER",
        imageUrl: "https://example.com/avatar.jpg",
      } as any,
    });
  });

  it("renders profile name and role for logged in user", async () => {
    await render(<Header />);

    expect(screen.getByText("Alice Cooper")).toBeTruthy();
    expect(screen.getByText("MANAGER")).toBeTruthy();
  });

  it("renders fallback guest and visitor text when user is undefined", async () => {
    useAuthStore.setState({ user: undefined });
    await render(<Header />);

    expect(screen.getByText("Guest")).toBeTruthy();
    expect(screen.getByText("Visitor")).toBeTruthy();
  });

  it("calls fetchAll on reference store when transactionTypes is empty", async () => {
    useReferenceStore.setState({
      transactionTypes: [],
      fetchAll: mockFetchAll,
    });

    await render(<Header />);

    expect(mockFetchAll).toHaveBeenCalledTimes(1);
  });

  it("does not call fetchAll if transactionTypes are already present", async () => {
    useReferenceStore.setState({
      transactionTypes: [{ code: "DINE_IN", name: "Dine In" } as any],
      fetchAll: mockFetchAll,
    });

    await render(<Header />);

    expect(mockFetchAll).not.toHaveBeenCalled();
  });

  it("renders children elements passed into header", async () => {
    await render(
      <Header>
        <Text>Custom Search Action</Text>
      </Header>,
    );

    expect(screen.getByText("Custom Search Action")).toBeTruthy();
  });
});
