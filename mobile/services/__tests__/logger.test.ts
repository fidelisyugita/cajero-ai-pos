import Logger from "../logger";

describe("Logger", () => {
  let logSpy: jest.SpyInstance;
  let infoSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe("when __DEV__ is true", () => {
    beforeAll(() => {
      (global as any).__DEV__ = true;
    });

    it("Logger.log should log messages and arguments to console.log", () => {
      Logger.log("Test log message", { extra: 123 }, "arg2");
      expect(logSpy).toHaveBeenCalledWith("Test log message", { extra: 123 }, "arg2");
    });

    it("Logger.info should log messages and arguments to console.info", () => {
      Logger.info("Test info message", 456);
      expect(infoSpy).toHaveBeenCalledWith("Test info message", 456);
    });

    it("Logger.warn should log messages and arguments to console.warn", () => {
      Logger.warn("Test warn message", "warning details");
      expect(warnSpy).toHaveBeenCalledWith("Test warn message", "warning details");
    });

    it("Logger.error should log messages and arguments to console.error", () => {
      Logger.error("Test error message", new Error("Fatal"));
      expect(errorSpy).toHaveBeenCalledWith("Test error message", expect.any(Error));
    });
  });

  describe("when __DEV__ is false", () => {
    beforeEach(() => {
      (global as any).__DEV__ = false;
    });

    afterEach(() => {
      (global as any).__DEV__ = true;
    });

    it("Logger methods should remain silent in production mode", () => {
      Logger.log("Production log");
      Logger.info("Production info");
      Logger.warn("Production warn");
      Logger.error("Production error");

      expect(logSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });
});
