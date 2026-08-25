import { fireEvent, render, screen } from "@testing-library/react-native";
import Select from "../Select";

describe("Select component", () => {
  const options = [
    { label: "Option 1", value: "opt1" },
    { label: "Option 2", value: "opt2" },
    { label: "Option 3", value: "opt3" },
  ];

  it("renders with placeholder when no value is selected", async () => {
    await render(<Select onSelect={jest.fn()} options={options} placeholder="Choose an option" />);

    expect(screen.getByText("Choose an option")).toBeTruthy();
  });

  it("renders selected option label when value matches an option", async () => {
    await render(<Select onSelect={jest.fn()} options={options} value="opt2" />);

    expect(screen.getByText("Option 2")).toBeTruthy();
  });

  it("renders label when provided", async () => {
    await render(<Select label="Category" onSelect={jest.fn()} options={options} />);

    expect(screen.getByText("Category")).toBeTruthy();
  });

  it("opens modal and allows selecting an option", async () => {
    const handleSelect = jest.fn();
    await render(<Select onSelect={handleSelect} options={options} placeholder="Choose item" />);

    const trigger = screen.getByText("Choose item");
    fireEvent.press(trigger);

    // After opening modal, all options should be visible
    expect(await screen.findByText("Option 1")).toBeTruthy();
    expect(await screen.findByText("Option 2")).toBeTruthy();
    expect(await screen.findByText("Option 3")).toBeTruthy();

    // Select Option 3
    fireEvent.press(await screen.findByText("Option 3"));

    expect(handleSelect).toHaveBeenCalledWith("opt3");
  });

  it("does not open modal when disabled", async () => {
    await render(
      <Select disabled onSelect={jest.fn()} options={options} placeholder="Disabled select" />,
    );

    const trigger = screen.getByText("Disabled select");
    fireEvent.press(trigger);

    // Options should not be rendered in visible modal
    expect(screen.queryByText("Option 1")).toBeNull();
  });
});
