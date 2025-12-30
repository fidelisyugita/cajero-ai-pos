import { Dimensions, type ScaledSize } from "react-native";

// Constants
const GUIDELINE_BASE_WIDTH = 1024;
const GUIDELINE_BASE_HEIGHT = 1366;
const DEFAULT_MODERATE_FACTOR = 0.5;

// Screen dimensions
const { width, height }: ScaledSize = Dimensions.get("window");
const [shortDimension, longDimension] =
	width < height ? [width, height] : [height, width];

// Scaling functions
const scale = (size: number): number =>
	(shortDimension / GUIDELINE_BASE_WIDTH) * size;

const verticalScale = (size: number): number =>
	(longDimension / GUIDELINE_BASE_HEIGHT) * size;

const moderateScale = (
	size: number,
	factor: number = DEFAULT_MODERATE_FACTOR,
): number => size + (scale(size) - size) * factor;

const moderateVerticalScale = (
	size: number,
	factor: number = DEFAULT_MODERATE_FACTOR,
): number => size + (verticalScale(size) - size) * factor;

// Aliases (shorter names)
const s = scale;
const vs = verticalScale;
const ms = moderateScale;
const mvs = moderateVerticalScale;

export {
	scale,
	verticalScale,
	moderateScale,
	moderateVerticalScale,
	s,
	vs,
	ms,
	mvs,
};
