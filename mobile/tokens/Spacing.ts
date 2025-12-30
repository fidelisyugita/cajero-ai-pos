import { vs } from "@/utils/Scale";

const spacing = {
	none: 0,
	xs: vs(4),
	sm: vs(8),
	md: vs(12),
	lg: vs(16),
	xl: vs(24),
	xxl: vs(32),
	xxxl: vs(48),
};

export default spacing;
export type Spacing = typeof spacing;
