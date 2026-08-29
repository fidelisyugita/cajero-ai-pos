import * as Sentry from "@sentry/react-native";
import type React from "react";
import { getAppEnvironment, getAppVersion, getBuildNumber } from "@/utils/AppInfo";
import { sanitizeString, sanitizeTelemetry } from "./sanitizeTelemetry";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim() || "";

// Only enable in real production release builds with a configured DSN
export const isSentryEnabled =
  !__DEV__ &&
  process.env.NODE_ENV !== "test" &&
  dsn.length > 0 &&
  dsn !== "https://your_sentry_dsn@sentry.io/project";

export const IGNORED_ERROR_PATTERNS = [
  /Network request failed/i,
  /AbortError/i,
  /The user aborted a request/i,
  /Failed to fetch/i,
  /NetworkError/i,
  /TimeoutError/i,
  /Socket closed/i,
  /CanceledError/i,
  /ERR_CANCELED/i,
  /ECONNRESET/i,
  /ETIMEDOUT/i,
];

const DEDUPE_WINDOW_MS = 10000; // 10 seconds
const recentErrors = new Map<string, number>();

/**
 * Resets the burst deduplication cache (useful for testing).
 */
export const clearRecentErrorsForTesting = (): void => {
  recentErrors.clear();
};

/**
 * Generates a stable signature for an error event to detect repeated burst occurrences.
 */
export const getErrorSignature = (event: Sentry.Event): string => {
  const exception = event.exception?.values?.[0];
  const type = exception?.type || "";
  const value = exception?.value || event.message || "";
  const topFrame = exception?.stacktrace?.frames?.slice(-1)[0];
  const frameInfo = topFrame ? `${topFrame.filename}:${topFrame.lineno}` : "";
  return `${type}:${value}:${frameInfo}`;
};

/**
 * Returns true if an identical error signature was already processed within the deduplication window.
 */
export const isDuplicateBurstError = (
  signature: string,
  now: number = Date.now(),
  windowMs: number = DEDUPE_WINDOW_MS,
): boolean => {
  // Purge expired entries older than 60s to prevent memory accumulation
  for (const [key, timestamp] of recentErrors.entries()) {
    if (now - timestamp > 60000) {
      recentErrors.delete(key);
    }
  }

  const lastSeen = recentErrors.get(signature);
  if (lastSeen && now - lastSeen < windowMs) {
    return true;
  }

  recentErrors.set(signature, now);
  return false;
};

/**
 * Checks whether an incoming error event matches benign offline/network error patterns.
 */
export const isIgnoredError = (event: Sentry.Event): boolean => {
  const message = event.message || "";
  const exceptionValue = event.exception?.values?.[0]?.value || "";
  const exceptionType = event.exception?.values?.[0]?.type || "";
  const combined = `${exceptionType} ${message} ${exceptionValue}`;
  return IGNORED_ERROR_PATTERNS.some((pattern) => pattern.test(combined));
};

/**
 * Filters and sanitizes events prior to sending them to Sentry.
 */
export const handleBeforeSend = <T extends Sentry.Event>(event: T, _hint?: unknown): T | null => {
  // 1. Noise Filter: Ignore expected offline network drops to conserve 5k monthly quota
  if (isIgnoredError(event)) {
    return null;
  }

  // 2. Rate-limit repetitive error bursts within 10s
  const signature = getErrorSignature(event);
  if (isDuplicateBurstError(signature)) {
    return null;
  }

  // 3. PII Scrubbing: Sanitize sensitive authorization headers
  if (event.request?.headers) {
    if (event.request.headers.Authorization) {
      event.request.headers.Authorization = "[REDACTED]";
    }
    if (event.request.headers.authorization) {
      event.request.headers.authorization = "[REDACTED]";
    }
  }

  // 4. Sanitize extra diagnostics payload
  if (event.extra) {
    event.extra = sanitizeTelemetry(event.extra);
  }

  return event;
};

/**
 * Sanitizes breadcrumb content before attaching to the diagnostic trail.
 */
export const handleBeforeBreadcrumb = (breadcrumb: Sentry.Breadcrumb): Sentry.Breadcrumb | null => {
  if (breadcrumb.message) {
    breadcrumb.message = sanitizeString(breadcrumb.message);
  }
  if (breadcrumb.data) {
    breadcrumb.data = sanitizeTelemetry(breadcrumb.data);
  }
  return breadcrumb;
};

/**
 * Initializes Sentry for error tracking and crash reporting.
 * In development or testing, this safely executes as a no-op.
 */
export const initSentry = (): void => {
  if (!isSentryEnabled) return;

  const appEnv = getAppEnvironment();
  const appVersion = getAppVersion();
  const buildNumber = getBuildNumber();

  Sentry.init({
    dsn,
    enabled: isSentryEnabled,
    environment: appEnv,
    release: `cajero-mobile@${appVersion}`,
    dist: buildNumber,
    tracesSampleRate: 0.2,
    enableAutoSessionTracking: true,
    enableNativeCrashHandling: true,
    maxBreadcrumbs: 50,
    ignoreErrors: IGNORED_ERROR_PATTERNS,
    beforeSend: handleBeforeSend,
    beforeBreadcrumb: handleBeforeBreadcrumb,
  });
};

/**
 * Wraps the root component with Sentry ErrorBoundary and performance instrumentation.
 * In development or testing, this returns the original component directly.
 */
export const wrapRootComponent = <P extends object>(
  Component: React.ComponentType<P>,
): React.ComponentType<P> => {
  if (isSentryEnabled) {
    // biome-ignore lint/suspicious/noExplicitAny: Generic root wrapper compatibility
    return Sentry.wrap(Component as React.ComponentType<any>) as unknown as React.ComponentType<P>;
  }
  return Component;
};

/**
 * Captures an exception and reports it to Sentry in production.
 */
export const captureSentryException = (error: unknown, context?: Record<string, unknown>): void => {
  if (!isSentryEnabled) return;

  try {
    const sanitizedContext = context ? sanitizeTelemetry(context) : undefined;
    const sanitizedError = error instanceof Error ? sanitizeTelemetry(error) : error;
    Sentry.captureException(sanitizedError, { extra: sanitizedContext });
  } catch {
    // Fail silently in high-volume environments
  }
};

/**
 * Captures a diagnostic message to Sentry in production.
 */
export const captureSentryMessage = (
  message: string,
  level: Sentry.SeverityLevel = "info",
): void => {
  if (!isSentryEnabled) return;

  try {
    Sentry.captureMessage(sanitizeString(message), level);
  } catch {
    // Fail silently
  }
};

/**
 * Adds a breadcrumb to Sentry's diagnostic trail.
 */
export const addSentryBreadcrumb = (breadcrumb: Sentry.Breadcrumb): void => {
  if (!isSentryEnabled) return;

  try {
    const sanitizedBreadcrumb: Sentry.Breadcrumb = {
      ...breadcrumb,
      message: breadcrumb.message ? sanitizeString(breadcrumb.message) : undefined,
      data: breadcrumb.data ? sanitizeTelemetry(breadcrumb.data) : undefined,
    };
    Sentry.addBreadcrumb(sanitizedBreadcrumb);
  } catch {
    // Fail silently
  }
};

/**
 * Attaches the active cashier or store owner identity to Sentry.
 */
export const setSentryUser = (user: {
  id: string;
  email?: string;
  roleCode?: string;
  storeId?: string;
}): void => {
  if (!isSentryEnabled) return;

  try {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.roleCode,
      segment: user.storeId,
    });
  } catch {
    // Fail silently
  }
};

/**
 * Clears the Sentry user scope on logout.
 */
export const clearSentryUser = (): void => {
  if (!isSentryEnabled) return;

  try {
    Sentry.setUser(null);
  } catch {
    // Fail silently
  }
};

export default Sentry;
