type LogLevel = "info" | "warn" | "error";

const Logger = {
  log: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.log(message, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.info(message, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.warn(message, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.error(message, ...args);
    }
  },
};

export default Logger;
