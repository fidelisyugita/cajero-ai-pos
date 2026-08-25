import React from "react";
import { View } from "react-native";
import {
  addSentryBreadcrumb,
  captureSentryException,
  captureSentryMessage,
  clearSentryUser,
  initSentry,
  isSentryEnabled,
  setSentryUser,
  wrapRootComponent,
} from "../sentry";

describe("sentry configuration and helpers", () => {
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
});
