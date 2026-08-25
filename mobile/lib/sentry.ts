import * as Sentry from "@sentry/react-native";
import type React from "react";
import { sanitizeString, sanitizeTelemetry } from "./sanitizeTelemetry";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim() || "";

// Only enable in real production release builds with a configured DSN
export const isSentryEnabled =
  !__DEV__ &&
  process.env.NODE_ENV !== "test" &&
  dsn.length > 0 &&
  dsn !== "https://your_sentry_dsn@sentry.io/project";

/**
 * Initializes Sentry for error tracking and crash reporting.
 * In development or testing, this safely executes as a no-op.
 */
export const initSentry = (): void => {
  if (!isSentryEnabled) return;

  Sentry.init({
    dsn,
    enabled: isSentryEnabled,
    tracesSampleRate: 0.2,
    enableAutoSessionTracking: true,
    enableNativeCrashHandling: true,
    maxBreadcrumbs: 100,
    beforeSend(event) {
      // PII Scrubbing: Sanitize sensitive merchant and customer transaction data
      if (event.request?.headers) {
        if (event.request.headers.Authorization) {
          event.request.headers.Authorization = "[REDACTED]";
        }
        if (event.request.headers.authorization) {
          event.request.headers.authorization = "[REDACTED]";
        }
      }

      if (event.extra) {
        event.extra = sanitizeTelemetry(event.extra);
      }

      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.message) {
        breadcrumb.message = sanitizeString(breadcrumb.message);
      }
      if (breadcrumb.data) {
        breadcrumb.data = sanitizeTelemetry(breadcrumb.data);
      }
      return breadcrumb;
    },
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
