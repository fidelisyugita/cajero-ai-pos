import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import Input from "../Input";

describe("Input component", () => {
  it("renders correctly with placeholder", async () => {
    await render(<Input placeholder="Enter username" />);

    expect(screen.getByPlaceholderText("Enter username")).toBeTruthy();
  });

  it("renders label and defaults placeholder to label if none given", async () => {
    await render(<Input label="Email Address" />);

    expect(screen.getByText("Email Address")).toBeTruthy();
    expect(screen.getByPlaceholderText("Email Address")).toBeTruthy();
  });

  it("does not float label on focus alone when input is empty", async () => {
    await render(<Input label="Email Address" testID="email-input" />);

    const input = screen.getByTestId("email-input");
    expect(screen.getByPlaceholderText("Email Address")).toBeTruthy();

    await act(async () => {
      fireEvent(input, "focus");
    });

    // Still retains placeholder when focused without content
    expect(screen.getByPlaceholderText("Email Address")).toBeTruthy();
  });

  it("floats label when text is typed and returns to placeholder when cleared while focused", async () => {
    await render(<Input label="Email Address" testID="email-input" />);

    const input = screen.getByTestId("email-input");

    // Focus input - label does not float
    await act(async () => {
      fireEvent(input, "focus");
    });
    expect(screen.getByPlaceholderText("Email Address")).toBeTruthy();

    // Type text into input
    await act(async () => {
      fireEvent.changeText(input, "test@example.com");
    });

    // Clear text while still focused
    await act(async () => {
      fireEvent.changeText(input, "");
    });

    // Label should immediately return as placeholder inside input
    expect(screen.getByPlaceholderText("Email Address")).toBeTruthy();
  });

  it("shows custom placeholder when empty if both label and placeholder are provided", async () => {
    await render(
      <Input label="Email Address" placeholder="name@example.com" testID="email-input" />,
    );

    expect(screen.getByPlaceholderText("name@example.com")).toBeTruthy();

    const input = screen.getByTestId("email-input");
    await act(async () => {
      fireEvent(input, "focus");
    });

    // When focused and empty, continues to show the custom placeholder
    expect(screen.getByPlaceholderText("name@example.com")).toBeTruthy();
  });

  it("handles controlled value correctly when value is provided vs empty", async () => {
    const { rerender } = await render(
      <Input label="Email Address" testID="email-input" value="user@test.com" />,
    );

    expect(screen.getByText("Email Address")).toBeTruthy();

    await rerender(<Input label="Email Address" testID="email-input" value="" />);

    expect(screen.getByPlaceholderText("Email Address")).toBeTruthy();
  });

  it("handles text input change", async () => {
    const handleChangeText = jest.fn();
    await render(<Input onChangeText={handleChangeText} placeholder="Type here" value="" />);

    const input = screen.getByPlaceholderText("Type here");
    await act(async () => {
      fireEvent.changeText(input, "Hello World");
    });

    expect(handleChangeText).toHaveBeenCalledWith("Hello World");
  });

  it("restricts input when maxValue is set and input exceeds maxValue", async () => {
    const handleChangeText = jest.fn();
    await render(
      <Input
        keyboardType="numeric"
        maxValue={100}
        onChangeText={handleChangeText}
        placeholder="Enter amount"
        value=""
      />,
    );

    const input = screen.getByPlaceholderText("Enter amount");

    // Valid value within max
    await act(async () => {
      fireEvent.changeText(input, "50");
    });
    expect(handleChangeText).toHaveBeenCalledWith("50");

    // Invalid value exceeding max (e.g. 150)
    await act(async () => {
      fireEvent.changeText(input, "150");
    });
    expect(handleChangeText).toHaveBeenCalledTimes(1); // not called again
  });

  it("handles focus and blur events", async () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();

    await render(
      <Input
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder="Focus test"
        testID="my-input"
      />,
    );

    const input = screen.getByTestId("my-input");
    await act(async () => {
      fireEvent(input, "focus");
    });
    expect(handleFocus).toHaveBeenCalled();

    await act(async () => {
      fireEvent(input, "blur");
    });
    expect(handleBlur).toHaveBeenCalled();
  });

  it("renders error text when error prop is provided", async () => {
    await render(<Input error="This field is required" placeholder="Required input" />);

    expect(screen.getByText("This field is required")).toBeTruthy();
  });

  it("renders left and right adornments when provided", async () => {
    await render(
      <Input
        left={<Text testID="left-adornment">Prefix</Text>}
        placeholder="Adorned input"
        right={<Text testID="right-adornment">Suffix</Text>}
      />,
    );

    expect(screen.getByTestId("left-adornment")).toBeTruthy();
    expect(screen.getByTestId("right-adornment")).toBeTruthy();
    expect(screen.getByText("Prefix")).toBeTruthy();
    expect(screen.getByText("Suffix")).toBeTruthy();
  });

  it("handles multiline and disabled (editable=false) states", async () => {
    await render(
      <Input
        editable={false}
        multiline
        placeholder="Disabled multiline"
        testID="disabled-multiline"
      />,
    );

    const input = screen.getByTestId("disabled-multiline");
    expect(input.props.editable).toBe(false);
    expect(input.props.multiline).toBe(true);
  });

  it("renders across different size variants", async () => {
    const sizes: ("sm" | "md" | "lg")[] = ["sm", "md", "lg"];

    for (const size of sizes) {
      await render(<Input placeholder={`Input ${size}`} size={size} />);
      expect(screen.getByPlaceholderText(`Input ${size}`)).toBeTruthy();
    }
  });
});
