import { vs } from "@/utils/Scale";

const radius = {
	none: 0,
	xs: vs(2),
	sm: vs(4),
	md: vs(6),
	lg: vs(8),
	xl: vs(12),
	xxl: vs(16),
	xxxl: vs(24),
	full: 9999,
};

export default radius;
export type Radius = typeof radius;
