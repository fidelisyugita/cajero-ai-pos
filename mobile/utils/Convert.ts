export function rgbaStringToHex6(rgbaString: string): string {
	// Parse the RGBA string
	const rgbaMatch = rgbaString.match(
		/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i,
	);

	if (!rgbaMatch) {
		throw new Error("Invalid RGBA string format");
	}

	// Extract RGB values (ignore alpha)
	const r = parseInt(rgbaMatch[1], 10);
	const g = parseInt(rgbaMatch[2], 10);
	const b = parseInt(rgbaMatch[3], 10);

	// Validate RGB values
	if ([r, g, b].some((value) => isNaN(value) || value < 0 || value > 255)) {
		throw new Error("Invalid RGB values. Values must be between 0-255");
	}

	// Convert to hex with padding
	return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
