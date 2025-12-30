import { vs } from "@/utils/Scale";

const typography = {
	heading1: {
		fontFamily: "SemiBold",
		fontSize: vs(48),
		letterSpacing: vs(-0.01),
		lineHeight: vs(62),
	},
	heading2: {
		fontFamily: "SemiBold",
		fontSize: vs(36),
		letterSpacing: vs(-0.01),
		lineHeight: vs(48),
	},
	heading3: {
		fontFamily: "SemiBold",
		fontSize: vs(24),
		lineHeight: vs(36),
	},
	heading4: {
		fontFamily: "SemiBold",
		fontSize: vs(20),
		lineHeight: vs(28),
	},
	heading5: {
		fontFamily: "SemiBold",
		fontSize: vs(16),
		lineHeight: vs(24),
	},
	bodyXl: {
		fontFamily: "Regular",
		fontSize: vs(20),
		lineHeight: vs(28),
	},
	bodyLg: {
		fontFamily: "Regular",
		fontSize: vs(16),
		lineHeight: vs(24),
	},
	bodyMd: {
		fontFamily: "Regular",
		fontSize: vs(14),
		lineHeight: vs(20),
	},
	bodySm: {
		fontFamily: "Regular",
		fontSize: vs(12),
		lineHeight: vs(18),
	},
	bodyXs: {
		fontFamily: "Regular",
		fontSize: vs(10),
		letterSpacing: vs(0.01),
		lineHeight: vs(16),
	},
	labelXl: {
		fontFamily: "Medium",
		fontSize: vs(20),
		lineHeight: vs(28),
	},
	labelLg: {
		fontFamily: "Medium",
		fontSize: vs(16),
		lineHeight: vs(24),
	},
	labelMd: {
		fontFamily: "Medium",
		fontSize: vs(14),
		lineHeight: vs(20),
	},
	labelSm: {
		fontFamily: "Medium",
		fontSize: vs(12),
		lineHeight: vs(18),
	},
	labelXs: {
		fontFamily: "Medium",
		fontSize: vs(10),
		letterSpacing: vs(0.01),
		lineHeight: vs(14),
	},
	buttonLg: {
		fontFamily: "SemiBold",
		fontSize: vs(20),
		lineHeight: vs(28),
	},
	buttonMd: {
		fontFamily: "SemiBold",
		fontSize: vs(16),
		lineHeight: vs(24),
	},
	buttonSm: {
		fontFamily: "SemiBold",
		fontSize: vs(12),
		lineHeight: vs(18),
	},
};

export default typography;
export type Typography = typeof typography;
