import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { DMSans_500Medium } from "@expo-google-fonts/dm-sans/500Medium";
import { DMSans_600SemiBold } from "@expo-google-fonts/dm-sans/600SemiBold";
import { DMSans_700Bold } from "@expo-google-fonts/dm-sans/700Bold";
import { useFonts } from "expo-font";

const useCustomFonts = (): { loaded: boolean } => {
  const [loaded] = useFonts({
    Regular: DMSans_400Regular,
    Medium: DMSans_500Medium,
    SemiBold: DMSans_600SemiBold,
    Bold: DMSans_700Bold,
  });

  return { loaded };
};

export { useCustomFonts };
