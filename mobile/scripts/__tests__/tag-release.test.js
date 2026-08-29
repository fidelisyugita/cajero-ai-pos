const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { formatReleaseTag, tagRelease } = require("../tag-release");

describe("tag-release script", () => {
  describe("formatReleaseTag", () => {
    it("formats semantic version to mobile tag format", () => {
      expect(formatReleaseTag("1.1.0")).toBe("mobile-v1.1.0");
      expect(formatReleaseTag("v1.2.3")).toBe("mobile-v1.2.3");
      expect(formatReleaseTag("  2.0.0 ")).toBe("mobile-v2.0.0");
    });

    it("throws an error on empty or invalid version input", () => {
      expect(() => formatReleaseTag("")).toThrow("Invalid version provided");
      expect(() => formatReleaseTag(null)).toThrow("Invalid version provided");
      expect(() => formatReleaseTag(undefined)).toThrow("Invalid version provided");
    });
  });

  describe("tagRelease", () => {
    let tempDir;
    let tempPackageJson;
    let tempAppJson;
    let mockExec;
    let executedCommands;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tag-test-"));
      tempPackageJson = path.join(tempDir, "package.json");
      tempAppJson = path.join(tempDir, "app.json");

      fs.writeFileSync(
        tempPackageJson,
        JSON.stringify({ name: "cajero", version: "1.1.0" }, null, 2),
      );

      fs.writeFileSync(
        tempAppJson,
        JSON.stringify(
          {
            expo: {
              name: "Cajero",
              version: "1.1.0",
              android: {
                versionCode: 2,
              },
            },
          },
          null,
          2,
        ),
      );

      executedCommands = [];
      mockExec = jest.fn((cmd) => {
        executedCommands.push(cmd);
        if (cmd === "git status --porcelain") {
          return "";
        }
        if (cmd.startsWith("git tag -l")) {
          return "";
        }
        return "";
      });
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it("throws error when package.json does not exist", () => {
      expect(() =>
        tagRelease({
          packageJsonPath: path.join(tempDir, "non-existent.json"),
          exec: mockExec,
        }),
      ).toThrow("package.json not found");
    });

    it("throws error when version mismatch exists between package.json and app.json", () => {
      fs.writeFileSync(tempAppJson, JSON.stringify({ expo: { version: "1.0.0" } }, null, 2));

      expect(() =>
        tagRelease({
          packageJsonPath: tempPackageJson,
          appJsonPath: tempAppJson,
          exec: mockExec,
        }),
      ).toThrow("Version mismatch");
    });

    it("throws error when working directory is dirty without allowDirty flag", () => {
      mockExec = jest.fn((cmd) => {
        if (cmd === "git status --porcelain") {
          return " M package.json";
        }
        return "";
      });

      expect(() =>
        tagRelease({
          packageJsonPath: tempPackageJson,
          appJsonPath: tempAppJson,
          allowDirty: false,
          exec: mockExec,
        }),
      ).toThrow("Working directory has uncommitted changes");
    });

    it("allows dirty working directory when allowDirty is true", () => {
      mockExec = jest.fn(() => "");

      const result = tagRelease({
        packageJsonPath: tempPackageJson,
        appJsonPath: tempAppJson,
        allowDirty: true,
        dryRun: true,
        exec: mockExec,
      });

      expect(result.tagName).toBe("mobile-v1.1.0");
      expect(result.dryRun).toBe(true);
    });

    it("throws error if tag already exists locally without force flag", () => {
      mockExec = jest.fn((cmd) => {
        if (cmd === "git status --porcelain") return "";
        if (cmd === 'git tag -l "mobile-v1.1.0"') return "mobile-v1.1.0";
        return "";
      });

      expect(() =>
        tagRelease({
          packageJsonPath: tempPackageJson,
          appJsonPath: tempAppJson,
          force: false,
          exec: mockExec,
        }),
      ).toThrow('Tag "mobile-v1.1.0" already exists');
    });

    it("creates tag with custom message and pushes to origin when push flag is true", () => {
      const result = tagRelease({
        packageJsonPath: tempPackageJson,
        appJsonPath: tempAppJson,
        push: true,
        message: "Production Release 1.1.0",
        exec: mockExec,
      });

      expect(result.tagName).toBe("mobile-v1.1.0");
      expect(result.pushed).toBe(true);
      expect(executedCommands).toContain(
        'git tag -a "mobile-v1.1.0" -m "Production Release 1.1.0"',
      );
      expect(executedCommands).toContain('git push origin "mobile-v1.1.0"');
    });
  });
});
