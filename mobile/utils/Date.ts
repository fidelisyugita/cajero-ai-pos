import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import localizedFormat from "dayjs/plugin/localizedFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useLanguageStore } from "@/store/useLanguageStore";
import "dayjs/locale/id";
import "dayjs/locale/en";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

export type DateInput = string | number | Date | Dayjs | null | undefined;
export type AppLocale = "en" | "id";

export interface DateFormatOptions {
  locale?: AppLocale;
  isUtc?: boolean;
  fallback?: string;
}

export function getAppLocale(overrideLocale?: AppLocale): AppLocale {
  if (overrideLocale) {
    return overrideLocale;
  }
  try {
    return useLanguageStore.getState().language ?? "en";
  } catch {
    return "en";
  }
}

function parseIsoDate(date: string): Dayjs | null {
  const parsedIso = dayjs.utc(date).local();
  return parsedIso.isValid() ? parsedIso : null;
}

function parseRawDate(
  date: Exclude<DateInput, null | undefined | Dayjs>,
  isUtc: boolean,
): Dayjs | null {
  if (isUtc) {
    const parsedUtc = dayjs.utc(date);
    return parsedUtc.isValid() ? parsedUtc : null;
  }
  if (typeof date === "string" && date.includes("Z")) {
    return parseIsoDate(date);
  }
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed : null;
}

export function parseDate(date?: DateInput, isUtc = false): Dayjs | null {
  if (date === null || date === undefined || date === "") {
    return null;
  }
  if (dayjs.isDayjs(date)) {
    return date.isValid() ? date : null;
  }
  return parseRawDate(date, isUtc);
}

export function toDayjs(date?: DateInput, isUtc = false): Dayjs {
  const parsed = parseDate(date, isUtc);
  return parsed ?? dayjs();
}

export function toDate(date?: DateInput, isUtc = false): Date | null {
  const parsed = parseDate(date, isUtc);
  return parsed ? parsed.toDate() : null;
}

export function now(): Dayjs {
  return dayjs();
}

export function nowDate(): Date {
  return dayjs().toDate();
}

export function nowIso(): string {
  return dayjs().toISOString();
}

export function nowMs(): number {
  return dayjs().valueOf();
}

export function formatCustomDate(
  date: DateInput,
  formatPattern: string,
  options?: DateFormatOptions,
): string {
  const fallback = options?.fallback ?? "-";
  const parsed = parseDate(date, options?.isUtc);
  if (!parsed) {
    return fallback;
  }

  const locale = getAppLocale(options?.locale);
  return parsed.locale(locale).format(formatPattern);
}

export function formatDate(date?: DateInput, options?: DateFormatOptions): string {
  return formatCustomDate(date, "DD MMM YYYY", options);
}

export function formatShortDate(date?: DateInput, options?: DateFormatOptions): string {
  return formatCustomDate(date, "DD/MM/YYYY", options);
}

export function formatDateTime(date?: DateInput, options?: DateFormatOptions): string {
  return formatCustomDate(date, "DD/MM/YYYY HH:mm", options);
}

export function formatDateTimeNamed(date?: DateInput, options?: DateFormatOptions): string {
  return formatCustomDate(date, "DD MMM YYYY, HH:mm", options);
}

export function formatTime(date?: DateInput, options?: DateFormatOptions): string {
  return formatCustomDate(date, "HH:mm", options);
}

export function formatDayName(date?: DateInput, options?: DateFormatOptions): string {
  return formatCustomDate(date, "dddd", options);
}

export function formatDayDate(date?: DateInput, options?: DateFormatOptions): string {
  return formatCustomDate(date, "ddd, DD MMM", options);
}

export function formatDayDateYear(date?: DateInput, options?: DateFormatOptions): string {
  return formatCustomDate(date, "ddd, DD MMM YYYY", options);
}

export function formatDayDateTime(date?: DateInput, options?: DateFormatOptions): string {
  return formatCustomDate(date, "ddd, D MMM YYYY - HH:mm", options);
}

export function formatFullDate(date?: DateInput, options?: DateFormatOptions): string {
  return formatCustomDate(date, "dddd, D MMMM YYYY", options);
}

export function formatApiDate(date?: DateInput, options?: DateFormatOptions): string {
  return formatCustomDate(date, "YYYY-MM-DD", options);
}

export function formatDateRange(
  startDate?: DateInput,
  endDate?: DateInput,
  formatPattern = "DD/MM/YYYY",
  separator = " - ",
  options?: DateFormatOptions,
): string {
  const startStr = formatCustomDate(startDate, formatPattern, options);
  const endStr = formatCustomDate(endDate, formatPattern, options);
  return `${startStr}${separator}${endStr}`;
}

export type { Dayjs };
export { dayjs };
