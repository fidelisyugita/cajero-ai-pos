const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const {
  parseEnvFile,
  getCliArgument,
  resolveScannerConfig,
  runSonarScan,
} = require("../sonar-scanner");

describe("sonar-scanner script", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sonar-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe("parseEnvFile", () => {
    it("returns empty object if file does not exist", () => {
      const result = parseEnvFile(path.join(tempDir, "non-existent.env"));
      expect(result).toEqual({});
    });

    it("parses valid key-value pairs and skips comments", () => {
      const envPath = path.join(tempDir, ".env");
      fs.writeFileSync(
        envPath,
        "# Comment line\nSONAR_HOST_URL=http://localhost:9000\nSONAR_TOKEN=sqp_test123\n\nEMPTY_KEY=",
      );

      const result = parseEnvFile(envPath);
      expect(result.SONAR_HOST_URL).toBe("http://localhost:9000");
      expect(result.SONAR_TOKEN).toBe("sqp_test123");
      expect(result.EMPTY_KEY).toBe("");
    });
  });

  describe("getCliArgument", () => {
    it("parses flags with space separation (--token sqp_123)", () => {
      const args = ["--token", "sqp_123", "--server-url", "http://127.0.0.1:9000"];
      expect(getCliArgument("token", args)).toBe("sqp_123");
      expect(getCliArgument("server-url", args)).toBe("http://127.0.0.1:9000");
    });

    it("parses flags with equals notation (--token=sqp_123)", () => {
      const args = ["--token=sqp_123", "--server-url=http://custom-host:9000"];
      expect(getCliArgument("token", args)).toBe("sqp_123");
      expect(getCliArgument("server-url", args)).toBe("http://custom-host:9000");
    });

    it("returns undefined when flag is absent", () => {
      const args = ["--other=value"];
      expect(getCliArgument("token", args)).toBeUndefined();
    });
  });

  describe("resolveScannerConfig", () => {
    it("defaults to http://localhost:9000 when no config is provided", () => {
      const config = resolveScannerConfig({
        mobileDir: tempDir,
        args: [],
      });
      expect(config.serverUrl).toBe("http://localhost:9000");
      expect(config.mobileDir).toBe(tempDir);
    });

    it("prefers CLI argument over .env values", () => {
      fs.writeFileSync(
        path.join(tempDir, ".env"),
        "SONAR_HOST_URL=http://env-host:9000\nSONAR_TOKEN=sqp_env_token\n",
      );

      const config = resolveScannerConfig({
        mobileDir: tempDir,
        args: ["--token", "sqp_cli_token", "--server-url", "http://cli-host:9000"],
      });

      expect(config.token).toBe("sqp_cli_token");
      expect(config.serverUrl).toBe("http://cli-host:9000");
    });

    it("reads values from local .env when CLI arguments are not provided", () => {
      fs.writeFileSync(
        path.join(tempDir, ".env"),
        "SONAR_HOST_URL=http://my-sonar:9000\nSONAR_TOKEN=sqp_env_token_99\n",
      );

      const config = resolveScannerConfig({
        mobileDir: tempDir,
        args: [],
      });

      expect(config.token).toBe("sqp_env_token_99");
      expect(config.serverUrl).toBe("http://my-sonar:9000");
    });
  });

  describe("runSonarScan", () => {
    it("invokes scannerFn with resolved options and logs success", async () => {
      const stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
      const mockScannerFn = jest.fn().mockResolvedValue(undefined);

      await runSonarScan({
        mobileDir: tempDir,
        args: ["--token", "sqp_test_token", "--server-url", "http://localhost:9000"],
        scannerFn: mockScannerFn,
      });

      expect(mockScannerFn).toHaveBeenCalledWith({
        serverUrl: "http://localhost:9000",
        token: "sqp_test_token",
        options: {
          "sonar.projectBaseDir": tempDir,
          "sonar.login": "sqp_test_token",
          "sonar.token": "sqp_test_token",
        },
      });

      expect(stdoutSpy).toHaveBeenCalledWith(
        expect.stringContaining("SonarQube analysis completed successfully!"),
      );
      stdoutSpy.mockRestore();
    });

    it("handles errors from scannerFn gracefully", async () => {
      const stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
      const mockScannerFn = jest.fn().mockRejectedValue(new Error("Connection refused"));

      await expect(
        runSonarScan({
          mobileDir: tempDir,
          args: ["--token", "sqp_test_token"],
          scannerFn: mockScannerFn,
          throwOnError: true,
        }),
      ).rejects.toThrow("Connection refused");

      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining("SonarQube analysis failed"));
      stderrSpy.mockRestore();
    });
  });
});
