import { DMSans_100Thin } from "@expo-google-fonts/dm-sans/100Thin";
import { DMSans_100Thin_Italic } from "@expo-google-fonts/dm-sans/100Thin_Italic";
import { DMSans_200ExtraLight } from "@expo-google-fonts/dm-sans/200ExtraLight";
import { DMSans_200ExtraLight_Italic } from "@expo-google-fonts/dm-sans/200ExtraLight_Italic";
import { DMSans_300Light } from "@expo-google-fonts/dm-sans/300Light";
import { DMSans_300Light_Italic } from "@expo-google-fonts/dm-sans/300Light_Italic";
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { DMSans_400Regular_Italic } from "@expo-google-fonts/dm-sans/400Regular_Italic";
import { DMSans_500Medium } from "@expo-google-fonts/dm-sans/500Medium";
import { DMSans_500Medium_Italic } from "@expo-google-fonts/dm-sans/500Medium_Italic";
import { DMSans_600SemiBold } from "@expo-google-fonts/dm-sans/600SemiBold";
import { DMSans_600SemiBold_Italic } from "@expo-google-fonts/dm-sans/600SemiBold_Italic";
import { DMSans_700Bold } from "@expo-google-fonts/dm-sans/700Bold";
import { DMSans_700Bold_Italic } from "@expo-google-fonts/dm-sans/700Bold_Italic";
import { DMSans_800ExtraBold } from "@expo-google-fonts/dm-sans/800ExtraBold";
import { DMSans_800ExtraBold_Italic } from "@expo-google-fonts/dm-sans/800ExtraBold_Italic";
import { DMSans_900Black } from "@expo-google-fonts/dm-sans/900Black";
import { DMSans_900Black_Italic } from "@expo-google-fonts/dm-sans/900Black_Italic";
import { useFonts } from "expo-font";

const useCustomFonts = (): { loaded: boolean } => {
	const [loaded] = useFonts({
		Black: DMSans_900Black,
		"Black-Italic": DMSans_900Black_Italic,
		Bold: DMSans_700Bold,
		"Bold-Italic": DMSans_700Bold_Italic,
		ExtraBold: DMSans_800ExtraBold,
		"ExtraBold-Italic": DMSans_800ExtraBold_Italic,
		ExtraLight: DMSans_200ExtraLight,
		"ExtraLight-Italic": DMSans_200ExtraLight_Italic,
		Light: DMSans_300Light,
		"Light-Italic": DMSans_300Light_Italic,
		Medium: DMSans_500Medium,
		"Medium-Italic": DMSans_500Medium_Italic,
		Regular: DMSans_400Regular,
		"Regular-Italic": DMSans_400Regular_Italic,
		SemiBold: DMSans_600SemiBold,
		"SemiBold-Italic": DMSans_600SemiBold_Italic,
		Thin: DMSans_100Thin,
		"Thin-Italic": DMSans_100Thin_Italic,
	});

	return { loaded };
};
export { useCustomFonts };
