import type * as Sentry from "@sentry/react-native";
import React from "react";
import { View } from "react-native";
import {
  addSentryBreadcrumb,
  captureSentryException,
  captureSentryMessage,
  clearRecentErrorsForTesting,
  clearSentryUser,
  getErrorSignature,
  handleBeforeBreadcrumb,
  handleBeforeSend,
  initSentry,
  isDuplicateBurstError,
  isIgnoredError,
  isSentryEnabled,
  setSentryUser,
  wrapRootComponent,
} from "../sentry";

describe("sentry configuration and helpers", () => {
  beforeEach(() => {
    clearRecentErrorsForTesting();
  });

  it("is disabled in test environment", () => {
    expect(isSentryEnabled).toBe(false);
  });

  it("safely executes initSentry as a no-op when disabled", () => {
    expect(() => {
      initSentry();
    }).not.toThrow();
  });

  it("returns component unwrapped in development/test environment", () => {
    const DummyComponent = () => React.createElement(View);
    const Wrapped = wrapRootComponent(DummyComponent);
    expect(Wrapped).toBe(DummyComponent);
  });

  it("safely executes captureSentryException without throwing when disabled", () => {
    expect(() => {
      captureSentryException(new Error("Test POS crash"), { screen: "payment" });
    }).not.toThrow();
  });

  it("safely executes captureSentryMessage without throwing when disabled", () => {
    expect(() => {
      captureSentryMessage("Offline transaction buffer flushed", "info");
    }).not.toThrow();
  });

  it("safely executes addSentryBreadcrumb without throwing when disabled", () => {
    expect(() => {
      addSentryBreadcrumb({
        category: "printer",
        message: "BLE Printer disconnected",
        level: "warning",
      });
    }).not.toThrow();
  });

  it("safely executes setSentryUser and clearSentryUser without throwing when disabled", () => {
    expect(() => {
      setSentryUser({
        id: "cashier-1",
        email: "cashier@cajero.local",
        roleCode: "CASHIER",
        storeId: "store-001",
      });
      clearSentryUser();
    }).not.toThrow();
  });

  it("handles exceptions with sensitive payload fields without throwing", () => {
    expect(() => {
      captureSentryException(new Error("Card transaction failed for 4111222233334444"), {
        pin: "1234",
        authHeader: "Bearer eyJhbGciOi...",
      });
    }).not.toThrow();
  });

  describe("noise suppression & offline error filtering", () => {
    it("identifies expected offline network drops as ignored", () => {
      const networkEvent: Sentry.Event = {
        exception: {
          values: [{ type: "TypeError", value: "Network request failed" }],
        },
      };
      expect(isIgnoredError(networkEvent)).toBe(true);

      const abortEvent: Sentry.Event = {
        exception: {
          values: [{ type: "AbortError", value: "The user aborted a request." }],
        },
      };
      expect(isIgnoredError(abortEvent)).toBe(true);

      const timeoutEvent: Sentry.Event = {
        message: "ETIMEDOUT: Connection timed out",
      };
      expect(isIgnoredError(timeoutEvent)).toBe(true);
    });

    it("does not ignore real runtime exceptions or database errors", () => {
      const dbCrashEvent: Sentry.Event = {
        exception: {
          values: [{ type: "SqliteError", value: "disk I/O error or database corrupted" }],
        },
      };
      expect(isIgnoredError(dbCrashEvent)).toBe(false);

      const jsCrashEvent: Sentry.Event = {
        exception: {
          values: [{ type: "ReferenceError", value: "Cannot read property 'id' of undefined" }],
        },
      };
      expect(isIgnoredError(jsCrashEvent)).toBe(false);
    });

    it("drops ignored errors in handleBeforeSend to save monthly quota", () => {
      const event: Sentry.Event = {
        exception: {
          values: [{ type: "TypeError", value: "Failed to fetch" }],
        },
      };
      const result = handleBeforeSend(event);
      expect(result).toBeNull();
    });
  });

  describe("burst deduplication", () => {
    it("generates consistent error signatures", () => {
      const event: Sentry.Event = {
        exception: {
          values: [
            {
              type: "TypeError",
              value: "Invalid state transition",
              stacktrace: {
                frames: [{ filename: "PaymentScreen.tsx", lineno: 42 }],
              },
            },
          ],
        },
      };
      const signature = getErrorSignature(event);
      expect(signature).toBe("TypeError:Invalid state transition:PaymentScreen.tsx:42");
    });

    it("suppresses repeated burst occurrences of identical errors within 10 seconds", () => {
      const signature = "TypeError:render-loop:Checkout.tsx:10";
      const t0 = 100000;

      // First occurrence allowed
      expect(isDuplicateBurstError(signature, t0, 10000)).toBe(false);

      // Second occurrence within 5s suppressed
      expect(isDuplicateBurstError(signature, t0 + 5000, 10000)).toBe(true);

      // Third occurrence after 11s allowed
      expect(isDuplicateBurstError(signature, t0 + 11000, 10000)).toBe(false);
    });

    it("drops burst duplicate events in handleBeforeSend", () => {
      const event: Sentry.Event = {
        exception: {
          values: [{ type: "SyntaxError", value: "Unexpected token in offline sync queue" }],
        },
      };

      // First call processes normally
      const firstResult = handleBeforeSend({ ...event });
      expect(firstResult).not.toBeNull();

      // Immediate second call is suppressed as burst duplicate
      const secondResult = handleBeforeSend({ ...event });
      expect(secondResult).toBeNull();
    });
  });

  describe("PII scrubbing in beforeSend & beforeBreadcrumb", () => {
    it("redacts Authorization headers in handleBeforeSend", () => {
      const event: Sentry.Event = {
        exception: {
          values: [{ type: "Error", value: "Server 500 internal error" }],
        },
        request: {
          headers: {
            Authorization: "Bearer secret-cashier-jwt-token",
            "Content-Type": "application/json",
          },
        },
      };

      const result = handleBeforeSend(event);
      expect(result?.request?.headers?.Authorization).toBe("[REDACTED]");
    });

    it("sanitizes breadcrumb messages and sensitive telemetry data", () => {
      const breadcrumb: Sentry.Breadcrumb = {
        category: "auth",
        message: "Logged in user with Bearer secret-token-value-12345",
        data: {
          pin: "1234",
          storeId: "store-001",
        },
      };

      const sanitized = handleBeforeBreadcrumb(breadcrumb);
      expect(sanitized?.message).toContain("Bearer [REDACTED]");
      expect(sanitized?.data?.pin).toBe("[REDACTED]");
      expect(sanitized?.data?.storeId).toBe("store-001");
    });
  });
});
