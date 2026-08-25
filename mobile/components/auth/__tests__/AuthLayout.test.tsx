import { render, screen } from "@testing-library/react-native";
import { Text, View } from "react-native";
import AuthLayout from "../AuthLayout";

describe("AuthLayout component", () => {
  it("renders container with children", async () => {
    await render(
      <AuthLayout>
        <Text>Layout Child</Text>
      </AuthLayout>,
    );

    expect(screen.getByText("Layout Child")).toBeTruthy();
  });

  describe("AuthLayout.Intro", () => {
    it("renders intro content with position left", async () => {
      await render(
        <AuthLayout.Intro position="left">
          <Text>Intro Left Extra</Text>
        </AuthLayout.Intro>,
      );

      expect(screen.getByText("Intro Left Extra")).toBeTruthy();
    });

    it("renders intro content with position right", async () => {
      await render(
        <AuthLayout.Intro position="right">
          <Text>Intro Right Extra</Text>
        </AuthLayout.Intro>,
      );

      expect(screen.getByText("Intro Right Extra")).toBeTruthy();
    });
  });

  describe("AuthLayout.Main", () => {
    it("renders main container with title and form children", async () => {
      await render(
        <AuthLayout.Main title="Sign In Title">
          <View>
            <Text>Form Input Field</Text>
          </View>
        </AuthLayout.Main>,
      );

      expect(screen.getByText("Sign In Title")).toBeTruthy();
      expect(screen.getByText("Form Input Field")).toBeTruthy();
    });
  });
});
