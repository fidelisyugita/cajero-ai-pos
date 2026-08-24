import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import FormSectionCard from "../FormSectionCard";

describe("FormSectionCard component", () => {
  it("renders title and children correctly", async () => {
    await render(
      <FormSectionCard title="General Info">
        <Text testID="section-child">Inner Form Content</Text>
      </FormSectionCard>,
    );

    expect(screen.getByText("General Info")).toBeTruthy();
    expect(screen.getByTestId("section-child")).toBeTruthy();
    expect(screen.getByText("Inner Form Content")).toBeTruthy();
  });

  it("renders required indicator when required is true", async () => {
    await render(
      <FormSectionCard required title="Account Settings">
        <Text>Content</Text>
      </FormSectionCard>,
    );

    expect(screen.getByText("*")).toBeTruthy();
  });

  it("renders headerRight node when provided", async () => {
    await render(
      <FormSectionCard
        headerRight={<Text testID="header-right-badge">Edit</Text>}
        title="Payment Methods"
      >
        <Text>Content</Text>
      </FormSectionCard>,
    );

    expect(screen.getByTestId("header-right-badge")).toBeTruthy();
    expect(screen.getByText("Edit")).toBeTruthy();
  });
});
