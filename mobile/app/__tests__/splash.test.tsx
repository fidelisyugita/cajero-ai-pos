import { render } from "@testing-library/react-native";
import { Redirect, SplashScreen } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import SplashScreenController from "../splash";

describe("SplashScreenController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls SplashScreen.hideAsync and redirects to /sign-in when not logged in", async () => {
    useAuthStore.setState({ isLoggedIn: false });

    await render(<SplashScreenController />);

    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
    expect(Redirect).toHaveBeenCalledWith(expect.objectContaining({ href: "/sign-in" }), undefined);
  });

  it("returns null without redirecting to sign-in when logged in", async () => {
    useAuthStore.setState({ isLoggedIn: true });

    const { toJSON } = await render(<SplashScreenController />);

    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
    expect(toJSON()).toBeNull();
  });
});
