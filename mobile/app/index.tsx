import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";

export default function Index() {
  const { isLoggedIn } = useAuthStore();

  if (isLoggedIn) {
    return <Redirect href="/(dashboard)/menu" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
