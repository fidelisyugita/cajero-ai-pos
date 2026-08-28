import { useLanguageStore } from "@/store/useLanguageStore";
import {
  formatApiDate,
  formatCustomDate,
  formatDate,
  formatDateRange,
  formatDateTime,
  formatDateTimeNamed,
  formatDayDate,
  formatDayDateTime,
  formatDayDateYear,
  formatDayName,
  formatFullDate,
  formatShortDate,
  formatTime,
  getAppLocale,
  now,
  nowDate,
  nowIso,
  nowMs,
  parseDate,
  toDate,
  toDayjs,
} from "../Date";

describe("Date Utility", () => {
  beforeEach(() => {
    useLanguageStore.setState({ language: "en" });
  });

  describe("Locale Resolution", () => {
    it("returns default locale 'en' when store is 'en'", () => {
      expect(getAppLocale()).toBe("en");
    });

    it("returns store locale 'id' when store is 'id'", () => {
      useLanguageStore.setState({ language: "id" });
      expect(getAppLocale()).toBe("id");
    });

    it("prioritizes override locale over store locale", () => {
      useLanguageStore.setState({ language: "en" });
      expect(getAppLocale("id")).toBe("id");
    });
  });

  describe("parseDate, toDate and toDayjs", () => {
    it("returns null for null, undefined, empty string, and invalid date string", () => {
      expect(parseDate(null)).toBeNull();
      expect(parseDate(undefined)).toBeNull();
      expect(parseDate("")).toBeNull();
      expect(parseDate("invalid-date-string")).toBeNull();
      expect(toDate(null)).toBeNull();
      expect(toDate(undefined)).toBeNull();
      expect(toDate("")).toBeNull();
    });

    it("parses valid Date, ISO string, timestamp number, and Dayjs object", () => {
      const fixedIso = "2026-08-28T10:00:00.000Z";
      expect(parseDate(fixedIso)).not.toBeNull();
      expect(parseDate(new Date(fixedIso))).not.toBeNull();
      expect(parseDate(1756375200000)).not.toBeNull();
      expect(toDate(fixedIso)).toBeInstanceOf(Date);
    });

    it("toDayjs returns valid Dayjs instance even when passed null/invalid", () => {
      const result = toDayjs(null);
      expect(result.isValid()).toBe(true);
    });
  });

  describe("Convenience Constructors", () => {
    it("now() returns a valid Dayjs instance", () => {
      expect(now().isValid()).toBe(true);
    });

    it("nowDate() returns a valid Date instance", () => {
      expect(nowDate()).toBeInstanceOf(Date);
    });

    it("nowIso() returns an ISO string", () => {
      expect(typeof nowIso()).toBe("string");
      expect(nowIso()).toContain("T");
    });

    it("nowMs() returns a number", () => {
      expect(typeof nowMs()).toBe("number");
      expect(nowMs()).toBeGreaterThan(0);
    });
  });

  describe("Formatting Helpers (English)", () => {
    const testDate = "2026-08-28T14:30:00.000Z";

    it("formatDate formats to DD MMM YYYY", () => {
      const formatted = formatDate(testDate, { isUtc: true });
      expect(formatted).toBe("28 Aug 2026");
    });

    it("formatShortDate formats to DD/MM/YYYY", () => {
      const formatted = formatShortDate(testDate, { isUtc: true });
      expect(formatted).toBe("28/08/2026");
    });

    it("formatDateTime formats to DD/MM/YYYY HH:mm", () => {
      const formatted = formatDateTime(testDate, { isUtc: true });
      expect(formatted).toBe("28/08/2026 14:30");
    });

    it("formatDateTimeNamed formats to DD MMM YYYY, HH:mm", () => {
      const formatted = formatDateTimeNamed(testDate, { isUtc: true });
      expect(formatted).toBe("28 Aug 2026, 14:30");
    });

    it("formatTime formats to HH:mm", () => {
      const formatted = formatTime(testDate, { isUtc: true });
      expect(formatted).toBe("14:30");
    });

    it("formatDayName formats to dddd", () => {
      const formatted = formatDayName(testDate, { isUtc: true });
      expect(formatted).toBe("Friday");
    });

    it("formatDayDate formats to ddd, DD MMM", () => {
      const formatted = formatDayDate(testDate, { isUtc: true });
      expect(formatted).toBe("Fri, 28 Aug");
    });

    it("formatDayDateYear formats to ddd, DD MMM YYYY", () => {
      const formatted = formatDayDateYear(testDate, { isUtc: true });
      expect(formatted).toBe("Fri, 28 Aug 2026");
    });

    it("formatDayDateTime formats to ddd, D MMM YYYY - HH:mm", () => {
      const formatted = formatDayDateTime(testDate, { isUtc: true });
      expect(formatted).toBe("Fri, 28 Aug 2026 - 14:30");
    });

    it("formatFullDate formats to dddd, D MMMM YYYY", () => {
      const formatted = formatFullDate(testDate, { isUtc: true });
      expect(formatted).toBe("Friday, 28 August 2026");
    });

    it("formatApiDate formats to YYYY-MM-DD", () => {
      const formatted = formatApiDate(testDate, { isUtc: true });
      expect(formatted).toBe("2026-08-28");
    });

    it("formatDateRange formats two dates with separator", () => {
      const start = "2026-08-01T00:00:00.000Z";
      const end = "2026-08-15T00:00:00.000Z";
      const formatted = formatDateRange(start, end, "DD/MM/YYYY", " - ", { isUtc: true });
      expect(formatted).toBe("01/08/2026 - 15/08/2026");
    });

    it("formatters support being called with undefined/no args to format current date", () => {
      expect(formatDate().length).toBeGreaterThan(0);
      expect(formatFullDate().length).toBeGreaterThan(0);
    });
  });

  describe("Formatting Helpers (Indonesian)", () => {
    const testDate = "2026-08-28T14:30:00.000Z";

    beforeEach(() => {
      useLanguageStore.setState({ language: "id" });
    });

    it("formatDate translates month in Indonesian", () => {
      const formatted = formatDate(testDate, { isUtc: true });
      expect(formatted).toBe("28 Agt 2026");
    });

    it("formatDayName translates day in Indonesian", () => {
      const formatted = formatDayName(testDate, { isUtc: true });
      expect(formatted).toBe("Jumat");
    });

    it("formatDayDate translates short day and month in Indonesian", () => {
      const formatted = formatDayDate(testDate, { isUtc: true });
      expect(formatted).toBe("Jum, 28 Agt");
    });

    it("formatFullDate translates full date in Indonesian", () => {
      const formatted = formatFullDate(testDate, { isUtc: true });
      expect(formatted).toBe("Jumat, 28 Agustus 2026");
    });
  });

  describe("Fallback Handling", () => {
    it("returns default fallback '-' for invalid input", () => {
      expect(formatDate(null)).toBe("-");
      expect(formatDateTime(null)).toBe("-");
      expect(formatTime("")).toBe("-");
    });

    it("returns custom fallback if provided", () => {
      expect(formatDate(null, { fallback: "N/A" })).toBe("N/A");
      expect(formatCustomDate("invalid", "YYYY-MM-DD", { fallback: "Unknown" })).toBe("Unknown");
    });
  });
});
