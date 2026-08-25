import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useCategoryStore } from "@/store/useMenuCategoryStore";
import MenuSearchBar from "../MenuSearchBar";

describe("MenuSearchBar component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    useCategoryStore.setState({
      searchQuery: "",
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders search input with placeholder", async () => {
    await render(<MenuSearchBar />);

    expect(screen.getByPlaceholderText("Search Menu")).toBeTruthy();
  });

  it("debounces searchQuery updates to useCategoryStore by 300ms", async () => {
    await render(<MenuSearchBar />);

    const input = screen.getByPlaceholderText("Search Menu");
    await act(async () => {
      fireEvent.changeText(input, "Cappuccino");
    });

    // Before debounce timer runs
    expect(useCategoryStore.getState().searchQuery).toBe("");

    // Fast-forward debounce timer
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(useCategoryStore.getState().searchQuery).toBe("Cappuccino");
  });

  it("clears search query in local input and store when clear button is pressed", async () => {
    useCategoryStore.setState({ searchQuery: "Latte" });
    const { getByTestId } = await render(<MenuSearchBar />);

    // Fast forward to sync state
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    const clearButton = getByTestId("svg-mock");
    await act(async () => {
      fireEvent.press(clearButton);
    });

    expect(useCategoryStore.getState().searchQuery).toBe("");
    expect(screen.getByDisplayValue("")).toBeTruthy();
  });

  it("syncs local query when useCategoryStore is updated externally", async () => {
    await render(<MenuSearchBar />);

    await act(async () => {
      useCategoryStore.setState({ searchQuery: "Espresso" });
    });

    expect(screen.getByDisplayValue("Espresso")).toBeTruthy();
  });
});
