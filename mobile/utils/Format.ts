export function formatCurrency(amount: number): string {
	const numericAmount = Number(amount);
	if (Number.isNaN(numericAmount)) {
		return "Rp 0"; // Fallback for invalid numbers
	}

	const formatter = new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
		currencyDisplay: "symbol",
	});

	return formatter.format(numericAmount).replace("Rp", "Rp ");
}

export function parseCurrency(formattedValue: string): number {
	const numericString = formattedValue
		.replace(/[^\d]/g, "") // Remove all non-digit characters
		.trim();

	if (!numericString) {
		return 0;
	}

	return parseInt(numericString, 10);
}

export function formatNumber(amount: number): string {
	const formatter = new Intl.NumberFormat("id-ID", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
		useGrouping: true,
	});
	return formatter.format(amount);
}

export function parseNumber(formattedValue: string): number {
	const numericString = formattedValue
		.replace(/[^0-9,]/g, "") // Remove all except digits and comma
		.replace(/\./g, "") // Remove thousands separator
		.replace(",", "."); // Replace decimal comma with dot

	if (!numericString) {
		return 0;
	}

	return parseFloat(numericString);
}
