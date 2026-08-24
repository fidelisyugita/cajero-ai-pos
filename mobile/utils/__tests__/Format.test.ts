import { formatCurrency, formatNumber, parseCurrency, parseNumber } from "../Format";

describe("Format Utils", () => {
  describe("formatCurrency", () => {
    it("should correctly format positive numbers to IDR currency", () => {
      const result = formatCurrency(50000);
      // Normalize non-breaking spaces or standard spaces if any from Intl
      expect(result.replace(/\u00a0/g, " ")).toMatch(/^Rp\s+50\.000$/);
    });

    it("should format 0 correctly", () => {
      const result = formatCurrency(0);
      expect(result.replace(/\u00a0/g, " ")).toMatch(/^Rp\s+0$/);
    });

    it("should format large amounts correctly", () => {
      const result = formatCurrency(1500000);
      expect(result.replace(/\u00a0/g, " ")).toMatch(/^Rp\s+1\.500\.000$/);
    });

    it("should handle negative amounts", () => {
      const result = formatCurrency(-50000);
      // In id-ID, negative format can be -Rp 50.000 or (Rp 50.000)
      expect(result.replace(/\u00a0/g, " ")).toContain("50.000");
    });

    it("should return 'Rp 0' for NaN inputs", () => {
      expect(formatCurrency(Number.NaN)).toBe("Rp 0");
    });

    it("should round floating point numbers to whole integers", () => {
      const result = formatCurrency(12500.8);
      expect(result.replace(/\u00a0/g, " ")).toMatch(/^Rp\s+12\.501$/);
    });
  });

  describe("parseCurrency", () => {
    it("should parse standard formatted currency string into number", () => {
      expect(parseCurrency("Rp 50.000")).toBe(50000);
    });

    it("should parse string with variations like 'Rp. 1.500.000'", () => {
      expect(parseCurrency("Rp. 1.500.000")).toBe(1500000);
    });

    it("should parse plain numeric string", () => {
      expect(parseCurrency("75000")).toBe(75000);
    });

    it("should return 0 for empty string or whitespace", () => {
      expect(parseCurrency("")).toBe(0);
      expect(parseCurrency("   ")).toBe(0);
    });

    it("should return 0 when string has no numeric characters", () => {
      expect(parseCurrency("Rp ABC")).toBe(0);
      expect(parseCurrency("invalid")).toBe(0);
    });
  });

  describe("formatNumber", () => {
    it("should format standard integer with grouping separator", () => {
      const result = formatNumber(1000000);
      expect(result).toBe("1.000.000");
    });

    it("should format 0 correctly", () => {
      expect(formatNumber(0)).toBe("0");
    });

    it("should format small numbers without grouping", () => {
      expect(formatNumber(450)).toBe("450");
    });

    it("should round decimal numbers to 0 fraction digits", () => {
      expect(formatNumber(1234.56)).toBe("1.235");
    });
  });

  describe("parseNumber", () => {
    it("should parse Indonesian formatted number with comma as decimal", () => {
      expect(parseNumber("1.234,56")).toBe(1234.56);
    });

    it("should parse thousands separated numbers without decimal", () => {
      expect(parseNumber("1.500.000")).toBe(1500000);
    });

    it("should parse plain numbers", () => {
      expect(parseNumber("2500")).toBe(2500);
    });

    it("should return 0 for empty or whitespace string", () => {
      expect(parseNumber("")).toBe(0);
      expect(parseNumber("   ")).toBe(0);
    });

    it("should strip non-numeric and non-separator characters", () => {
      expect(parseNumber("qty: 50,5 pcs")).toBe(50.5);
    });
  });
});
