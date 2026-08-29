const fs = require("node:fs");
const path = require("node:path");

/**
 * Increments a SemVer string.
 * @param {string} currentVersion - e.g. "1.0.7"
 * @param {"major" | "minor" | "patch"} bumpType
 * @returns {string} - e.g. "1.0.8"
 */
function calculateNextVersion(currentVersion, bumpType) {
  const parts = currentVersion.split(".").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    throw new Error(`Invalid SemVer format: "${currentVersion}". Expected format: X.Y.Z`);
  }

  let [major, minor, patch] = parts;

  switch (bumpType) {
    case "major":
      major += 1;
      minor = 0;
      patch = 0;
      break;
    case "minor":
      minor += 1;
      patch = 0;
      break;
    case "patch":
      patch += 1;
      break;
    default:
      throw new Error(`Unknown bump type: "${bumpType}". Use "patch", "minor", or "major".`);
  }

  return `${major}.${minor}.${patch}`;
}

/**
 * Bumps the marketing version in package.json and syncs with app.json.
 */
function bumpVersion({
  bumpType = "patch",
  dryRun = false,
  packageJsonPath = path.resolve(__dirname, "../package.json"),
  appJsonPath = path.resolve(__dirname, "../app.json"),
} = {}) {
  const pkgContent = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const currentVersion = pkgContent.version || "1.0.0";
  const nextVersion = calculateNextVersion(currentVersion, bumpType);

  let appJsonContent = null;
  let nextVersionCode = null;

  if (fs.existsSync(appJsonPath)) {
    appJsonContent = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
    const currentVersionCode = appJsonContent.expo?.android?.versionCode ?? 1;
    nextVersionCode = currentVersionCode + 1;
  }

  if (dryRun) {
    return {
      previousVersion: currentVersion,
      nextVersion,
      nextVersionCode,
      dryRun: true,
    };
  }

  // Update package.json
  pkgContent.version = nextVersion;
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkgContent, null, 2)}\n`, "utf8");

  // Update app.json if present
  if (appJsonContent) {
    if (!appJsonContent.expo) appJsonContent.expo = {};
    appJsonContent.expo.version = nextVersion;

    if (!appJsonContent.expo.android) appJsonContent.expo.android = {};
    appJsonContent.expo.android.versionCode = nextVersionCode;

    fs.writeFileSync(appJsonPath, `${JSON.stringify(appJsonContent, null, 2)}\n`, "utf8");
  }

  return {
    previousVersion: currentVersion,
    nextVersion,
    nextVersionCode,
    dryRun: false,
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const bumpTypeArg = args.find((a) => !a.startsWith("--")) || "patch";

  try {
    const result = bumpVersion({ bumpType: bumpTypeArg, dryRun: isDryRun });
    if (isDryRun) {
      process.stdout.write(
        `[DRY RUN] Would bump version: ${result.previousVersion} -> ${result.nextVersion} (Android versionCode: ${result.nextVersionCode})\n`,
      );
    } else {
      process.stdout.write(
        `✅ Successfully bumped version: ${result.previousVersion} -> ${result.nextVersion} (Android versionCode: ${result.nextVersionCode})\n`,
      );
    }
  } catch (error) {
    process.stderr.write(`❌ Error bumping version: ${error.message}\n`);
    process.exit(1);
  }
}

module.exports = {
  calculateNextVersion,
  bumpVersion,
};
