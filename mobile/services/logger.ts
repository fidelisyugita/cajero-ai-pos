import { addSentryBreadcrumb, captureSentryException } from "@/lib/sentry";

const Logger = {
  log: (message: string, ...args: unknown[]) => {
    if (__DEV__) {
      // biome-ignore lint/suspicious/noConsole: Development debugging console logger
      console.log(message, ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (__DEV__) {
      // biome-ignore lint/suspicious/noConsole: Development debugging console logger
      console.info(message, ...args);
    } else {
      addSentryBreadcrumb({
        category: "app.info",
        message,
        level: "info",
      });
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.warn(message, ...args);
    } else {
      addSentryBreadcrumb({
        category: "app.warn",
        message,
        level: "warning",
      });
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.error(message, ...args);
    } else {
      addSentryBreadcrumb({
        category: "app.error",
        message,
        level: "error",
      });
      const errorObj = args.find((arg) => arg instanceof Error);
      if (errorObj) {
        captureSentryException(errorObj, { message });
      }
    }
  },
};

export default Logger;
