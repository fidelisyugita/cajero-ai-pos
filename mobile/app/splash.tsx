import { Redirect, SplashScreen } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";

const SplashScreenController = () => {
	const { isLoggedIn } = useAuthStore();
	SplashScreen.hideAsync();

	if (!isLoggedIn) {
		return <Redirect href="/sign-in" />;
	}

	return null;
};

export default SplashScreenController;
