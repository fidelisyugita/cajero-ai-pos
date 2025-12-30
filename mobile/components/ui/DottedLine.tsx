import { memo } from "react";
import { type StyleProp, View, type ViewStyle } from "react-native";
import Svg, { Line } from "react-native-svg";
import { useUnistyles } from "react-native-unistyles";
import { vs } from "@/utils/Scale";

interface DottedLineProps {
	orientation?: "horizontal" | "vertical";
	length?: number; // in px
	dashLength?: number; // length of each dot/dash
	gapLength?: number; // gap between dots/dashes
	thickness?: number; // stroke width
	color?: string;
	style?: StyleProp<ViewStyle>;
}

const DottedLine = ({
	orientation = "horizontal",
	length = vs(266),
	dashLength = vs(2),
	gapLength = vs(3),
	thickness = vs(2),
	color,
	style,
}: DottedLineProps) => {
	const { theme } = useUnistyles();
	const strokeColor = color || theme.colors.warning[200];

	const width = orientation === "horizontal" ? length : thickness;
	const height = orientation === "horizontal" ? thickness : length;

	// Line coordinates
	const x1 = 0;
	const y1 = thickness / 2;
	const x2 = orientation === "horizontal" ? length : thickness / 2;
	const y2 = orientation === "horizontal" ? thickness / 2 : length;

	return (
		<View style={style}>
			<Svg height={height} width={width}>
				<Line
					stroke={strokeColor}
					strokeDasharray={`${dashLength} ${gapLength}`}
					strokeLinecap="round"
					strokeWidth={thickness}
					x1={String(x1)}
					x2={String(x2)}
					y1={String(y1)}
					y2={String(y2)}
				/>
			</Svg>
		</View>
	);
};

export default memo(DottedLine);
