import { StyleSheet } from "react-native-unistyles";

import colors from "@/tokens/Colors";
import radius from "@/tokens/Radius";
import spacing from "@/tokens/Spacing";
import typography from "@/tokens/Typography";

const lightTheme = {
	colors: colors,
	typography: typography,
	spacing: spacing,
	radius: radius,
};

const darkTheme = lightTheme;

const breakpoints = {
	xs: 0,
	sm: 300,
	md: 500,
	lg: 800,
	xl: 1200,
};

const appThemes = {
	dark: darkTheme,
	light: lightTheme,
};

type AppBreakpoints = typeof breakpoints;
type AppThemes = typeof appThemes;

declare module "react-native-unistyles" {
	export interface UnistylesThemes extends AppThemes {}
	export interface UnistylesBreakpoints extends AppBreakpoints {}
	export type Theme = typeof lightTheme;
}

StyleSheet.configure({
	settings: {
		initialTheme: "light",
	},
	breakpoints,
	themes: appThemes,
});
