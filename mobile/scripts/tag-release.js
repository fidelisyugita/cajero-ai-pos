const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Returns formatted release tag for the mobile workspace (e.g. mobile-v1.1.0).
 * @param {string} version - Semantic version string (e.g. "1.1.0")
 * @returns {string} - Formatted release tag (e.g. "mobile-v1.1.0")
 */
function formatReleaseTag(version) {
  if (!version || typeof version !== "string") {
    throw new Error(`Invalid version provided: "${version}". Expected non-empty string.`);
  }
  const cleanVersion = version.trim().replace(/^v/, "");
  return `mobile-v${cleanVersion}`;
}

/**
 * Validates existence and synchronization of versions in package.json and app.json.
 */
function readAndValidateVersion(packageJsonPath, appJsonPath) {
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`package.json not found at ${packageJsonPath}`);
  }

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const version = pkg.version;
  if (!version) {
    throw new Error("No version field found in package.json");
  }

  if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
    const appVersion = appJson.expo?.version;
    if (appVersion && appVersion !== version) {
      throw new Error(
        `Version mismatch! package.json has "${version}" but app.json has "${appVersion}". Please sync versions first.`,
      );
    }
  }

  return version;
}

/**
 * Verifies git working directory is clean.
 */
function ensureCleanWorkingTree(exec, allowDirty) {
  if (allowDirty) return;
  const statusOutput = exec("git status --porcelain", { encoding: "utf8" }).trim();
  if (statusOutput.length > 0) {
    throw new Error(
      "Working directory has uncommitted changes. Please commit or stash before tagging, or pass --allow-dirty.",
    );
  }
}

/**
 * Validates tag uniqueness if not forced.
 */
function checkExistingTag(exec, tagName, force) {
  if (force) return;
  let tagExists = false;
  try {
    const existingTag = exec(`git tag -l "${tagName}"`, { encoding: "utf8" }).trim();
    tagExists = existingTag === tagName;
  } catch {
    tagExists = false;
  }

  if (tagExists) {
    throw new Error(
      `Tag "${tagName}" already exists locally. Use --force to overwrite or bump version first.`,
    );
  }
}

/**
 * Executes git tag creation and optional push.
 */
function createAndPushTag(exec, tagName, tagMessage, force, push) {
  const forceFlag = force ? "-f" : "";
  exec(`git tag -a "${tagName}" -m "${tagMessage}" ${forceFlag}`.trim(), { stdio: "inherit" });

  if (push) {
    const pushForceFlag = force ? "--force" : "";
    exec(`git push origin "${tagName}" ${pushForceFlag}`.trim(), { stdio: "inherit" });
  }
}

/**
 * Creates and optionally pushes a git release tag for the mobile workspace.
 */
function tagRelease({
  dryRun = false,
  push = false,
  force = false,
  message = null,
  allowDirty = false,
  packageJsonPath = path.resolve(__dirname, "../package.json"),
  appJsonPath = path.resolve(__dirname, "../app.json"),
  exec = execSync,
} = {}) {
  const version = readAndValidateVersion(packageJsonPath, appJsonPath);
  const tagName = formatReleaseTag(version);
  const tagMessage = message || `Release ${tagName}`;

  ensureCleanWorkingTree(exec, allowDirty);
  checkExistingTag(exec, tagName, force);

  if (dryRun) {
    return {
      tagName,
      tagMessage,
      version,
      dryRun: true,
      pushed: false,
    };
  }

  createAndPushTag(exec, tagName, tagMessage, force, push);

  return {
    tagName,
    tagMessage,
    version,
    dryRun: false,
    pushed: Boolean(push),
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const isPush = args.includes("--push");
  const isForce = args.includes("--force") || args.includes("-f");
  const isAllowDirty = args.includes("--allow-dirty");

  let customMessage = null;
  const msgIdx = args.findIndex((a) => a === "-m" || a === "--message");
  if (msgIdx !== -1 && args[msgIdx + 1]) {
    customMessage = args[msgIdx + 1];
  }

  try {
    const result = tagRelease({
      dryRun: isDryRun,
      push: isPush,
      force: isForce,
      allowDirty: isAllowDirty,
      message: customMessage,
    });

    if (result.dryRun) {
      process.stdout.write(
        `🔍 [DRY RUN] Would create tag: ${result.tagName} ("${result.tagMessage}")\n`,
      );
      if (isPush) {
        process.stdout.write(`🔍 [DRY RUN] Would push tag to origin: ${result.tagName}\n`);
      }
    } else {
      process.stdout.write(`🏷️  Created release tag: ${result.tagName}\n`);
      if (result.pushed) {
        process.stdout.write(`🚀 Pushed tag to origin: ${result.tagName}\n`);
      } else {
        process.stdout.write(`💡 To push tag manually, run: git push origin ${result.tagName}\n`);
      }
    }
  } catch (error) {
    process.stderr.write(`❌ Error creating tag: ${error.message}\n`);
    process.exit(1);
  }
}

module.exports = {
  formatReleaseTag,
  readAndValidateVersion,
  ensureCleanWorkingTree,
  checkExistingTag,
  createAndPushTag,
  tagRelease,
};
