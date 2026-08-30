const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { resolveConfig, uploadSourcemaps } = require("../upload-sourcemaps");

describe("upload-sourcemaps script", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sentry-test-"));
    fs.writeFileSync(
      path.join(tempDir, "package.json"),
      JSON.stringify({ name: "cajero", version: "1.1.0" }, null, 2),
    );
    fs.writeFileSync(
      path.join(tempDir, "app.json"),
      JSON.stringify({ expo: { android: { versionCode: 8 } } }, null, 2),
    );
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("throws error when SENTRY_AUTH_TOKEN is not provided", () => {
    const originalEnv = process.env.SENTRY_AUTH_TOKEN;
    delete process.env.SENTRY_AUTH_TOKEN;

    try {
      expect(() => resolveConfig(tempDir)).toThrow("SENTRY_AUTH_TOKEN is required");
    } finally {
      if (originalEnv) process.env.SENTRY_AUTH_TOKEN = originalEnv;
    }
  });

  it("resolves config correctly from .env file", () => {
    fs.writeFileSync(
      path.join(tempDir, ".env"),
      "SENTRY_AUTH_TOKEN=test-token-123\nSENTRY_ORG=custom-org\nSENTRY_PROJECT=custom-proj\n",
    );

    const config = resolveConfig(tempDir);
    expect(config.authToken).toBe("test-token-123");
    expect(config.org).toBe("custom-org");
    expect(config.project).toBe("custom-proj");
    expect(config.version).toBe("1.1.0");
    expect(config.release).toBe("cajero-mobile@1.1.0");
    expect(config.dist).toBe("8");
  });

  it("supports dry run mode without bundling", () => {
    fs.writeFileSync(path.join(tempDir, ".env"), "SENTRY_AUTH_TOKEN=test-token-123\n");
    const stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);

    expect(() => {
      uploadSourcemaps({ platform: "android", dryRun: true, mobileDir: tempDir });
    }).not.toThrow();

    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("[DRY RUN]"));
    stdoutSpy.mockRestore();
  });
});
