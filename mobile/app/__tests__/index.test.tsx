import { render } from "@testing-library/react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import Index from "../index";

describe("Root Index Screen", () => {
  it("redirects to /(auth)/sign-in when not logged in", async () => {
    useAuthStore.setState({ isLoggedIn: false });
    await render(<Index />);
    expect(Redirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(auth)/sign-in" }),
      undefined,
    );
  });

  it("redirects to /(dashboard)/menu when logged in", async () => {
    useAuthStore.setState({ isLoggedIn: true });
    await render(<Index />);
    expect(Redirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(dashboard)/menu" }),
      undefined,
    );
  });
});
