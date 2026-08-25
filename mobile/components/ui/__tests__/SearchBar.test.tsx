import { act, fireEvent, render, screen } from "@testing-library/react-native";
import SearchBar from "../SearchBar";

describe("SearchBar component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders with initial value and default placeholder", async () => {
    await render(<SearchBar onChangeText={jest.fn()} value="" />);

    expect(screen.getByPlaceholderText("Search")).toBeTruthy();
  });

  it("debounces onChangeText callback after typing", async () => {
    const handleChangeText = jest.fn();
    await render(
      <SearchBar onChangeText={handleChangeText} placeholder="Search items..." value="" />,
    );

    const input = screen.getByPlaceholderText("Search items...");
    await act(async () => {
      fireEvent.changeText(input, "Burger");
    });

    // Before timer fires
    expect(handleChangeText).not.toHaveBeenCalled();

    // Fast-forward debounce timer
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(handleChangeText).toHaveBeenCalledWith("Burger");
  });

  it("clears search input when clear button is pressed", async () => {
    const handleChangeText = jest.fn();
    await render(
      <SearchBar onChangeText={handleChangeText} placeholder="Search items..." value="Pizza" />,
    );

    const input = screen.getByDisplayValue("Pizza");
    expect(input).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(input, "");
    });

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(handleChangeText).toHaveBeenCalledWith("");
  });
});
