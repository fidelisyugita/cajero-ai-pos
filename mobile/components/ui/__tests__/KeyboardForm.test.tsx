import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import KeyboardForm from "../KeyboardForm";

describe("KeyboardForm component", () => {
  it("renders children inside KeyboardAvoidingView and ScrollView", async () => {
    await render(
      <KeyboardForm testID="custom-keyboard-form">
        <Text testID="form-input">Form Content Inside</Text>
      </KeyboardForm>,
    );

    expect(screen.getByTestId("custom-keyboard-form")).toBeTruthy();
    expect(screen.getByTestId("form-input")).toBeTruthy();
    expect(screen.getByText("Form Content Inside")).toBeTruthy();
  });
});
