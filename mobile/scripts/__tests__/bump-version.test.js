const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { calculateNextVersion, bumpVersion } = require("../bump-version");

describe("bump-version script", () => {
  describe("calculateNextVersion", () => {
    it("increments patch version correctly", () => {
      expect(calculateNextVersion("1.0.7", "patch")).toBe("1.0.8");
      expect(calculateNextVersion("0.1.9", "patch")).toBe("0.1.10");
    });

    it("increments minor version and resets patch", () => {
      expect(calculateNextVersion("1.0.7", "minor")).toBe("1.1.0");
      expect(calculateNextVersion("2.5.12", "minor")).toBe("2.6.0");
    });

    it("increments major version and resets minor and patch", () => {
      expect(calculateNextVersion("1.0.7", "major")).toBe("2.0.0");
      expect(calculateNextVersion("0.9.1", "major")).toBe("1.0.0");
    });

    it("throws an error on invalid SemVer input", () => {
      expect(() => calculateNextVersion("1.0", "patch")).toThrow("Invalid SemVer format");
      expect(() => calculateNextVersion("invalid", "minor")).toThrow("Invalid SemVer format");
    });

    it("throws an error on invalid bump type", () => {
      expect(() => calculateNextVersion("1.0.0", "invalid")).toThrow("Unknown bump type");
    });
  });

  describe("bumpVersion file operations", () => {
    let tempDir;
    let tempPackageJson;
    let tempAppJson;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "bump-test-"));
      tempPackageJson = path.join(tempDir, "package.json");
      tempAppJson = path.join(tempDir, "app.json");

      fs.writeFileSync(
        tempPackageJson,
        JSON.stringify({ name: "cajero", version: "1.0.7" }, null, 2),
      );

      fs.writeFileSync(
        tempAppJson,
        JSON.stringify(
          {
            expo: {
              name: "Cajero",
              version: "1.0.7",
              android: {
                versionCode: 1,
              },
            },
          },
          null,
          2,
        ),
      );
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it("performs dry run without modifying files", () => {
      const result = bumpVersion({
        bumpType: "patch",
        dryRun: true,
        packageJsonPath: tempPackageJson,
        appJsonPath: tempAppJson,
      });

      expect(result.previousVersion).toBe("1.0.7");
      expect(result.nextVersion).toBe("1.0.8");
      expect(result.nextVersionCode).toBe(2);
      expect(result.dryRun).toBe(true);

      const pkg = JSON.parse(fs.readFileSync(tempPackageJson, "utf8"));
      expect(pkg.version).toBe("1.0.7");
    });

    it("updates package.json and app.json on real run", () => {
      const result = bumpVersion({
        bumpType: "minor",
        dryRun: false,
        packageJsonPath: tempPackageJson,
        appJsonPath: tempAppJson,
      });

      expect(result.previousVersion).toBe("1.0.7");
      expect(result.nextVersion).toBe("1.1.0");
      expect(result.nextVersionCode).toBe(2);

      const pkg = JSON.parse(fs.readFileSync(tempPackageJson, "utf8"));
      expect(pkg.version).toBe("1.1.0");

      const appJson = JSON.parse(fs.readFileSync(tempAppJson, "utf8"));
      expect(appJson.expo.version).toBe("1.1.0");
      expect(appJson.expo.android.versionCode).toBe(2);
    });
  });
});
