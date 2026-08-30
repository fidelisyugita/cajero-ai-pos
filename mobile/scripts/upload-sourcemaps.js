const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...values] = trimmed.split("=");
    env[key.trim()] = values.join("=").trim();
  }
  return env;
}

function resolveConfig(mobileDir) {
  const localEnv = parseEnvFile(path.join(mobileDir, ".env"));
  const rootEnv = parseEnvFile(path.join(mobileDir, "../.env"));

  const authToken =
    process.env.SENTRY_AUTH_TOKEN || localEnv.SENTRY_AUTH_TOKEN || rootEnv.SENTRY_AUTH_TOKEN;
  const org = process.env.SENTRY_ORG || localEnv.SENTRY_ORG || rootEnv.SENTRY_ORG || "cajero-bj";
  const project =
    process.env.SENTRY_PROJECT ||
    localEnv.SENTRY_PROJECT ||
    rootEnv.SENTRY_PROJECT ||
    "react-native";

  if (!authToken) {
    throw new Error(
      "SENTRY_AUTH_TOKEN is required. Set it in your environment or in mobile/.env file.",
    );
  }

  const pkgPath = path.join(mobileDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const version = pkg.version || "1.0.0";

  let versionCode = "1";
  const appJsonPath = path.join(mobileDir, "app.json");
  if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
    const androidCode = appJson.expo?.android?.versionCode;
    if (androidCode !== undefined) {
      versionCode = String(androidCode);
    }
  }

  const release = `cajero-mobile@${version}`;
  const dist = versionCode;

  return { authToken, org, project, version, release, dist };
}

function bundlePlatform(mobileDir, tempDir, platform) {
  const isAndroid = platform === "android";
  const bundleFilename = isAndroid ? "index.android.bundle" : "main.jsbundle";
  const bundlePath = path.join(tempDir, bundleFilename);
  const sourcemapPath = path.join(tempDir, `${bundleFilename}.map`);

  process.stdout.write(`📦 Bundling ${platform} JavaScript and source maps...\n`);

  const expoCli = path.join(mobileDir, "node_modules/.bin/expo");
  const bundleCmd = [
    `"${expoCli}"`,
    "export:embed",
    `--platform ${platform}`,
    "--dev false",
    "--entry-file index.ts",
    `--bundle-output "${bundlePath}"`,
    `--sourcemap-output "${sourcemapPath}"`,
    `--assets-dest "${tempDir}"`,
  ].join(" ");

  execSync(bundleCmd, { cwd: mobileDir, stdio: "inherit" });

  return { bundlePath, sourcemapPath };
}

function uploadArtifacts(mobileDir, platform, paths, config) {
  process.stdout.write(
    `🚀 Uploading ${platform} source maps to Sentry (${config.release}, dist ${config.dist})...\n`,
  );

  const sentryCli = path.join(mobileDir, "node_modules/.bin/sentry-cli");
  const isAndroid = platform === "android";
  const subCommand = isAndroid ? "gradle" : "xcode";

  const uploadCmd = [
    `"${sentryCli}"`,
    `--auth-token "${config.authToken}"`,
    "react-native",
    subCommand,
    `--org "${config.org}"`,
    `--project "${config.project}"`,
    `--bundle "${paths.bundlePath}"`,
    `--sourcemap "${paths.sourcemapPath}"`,
    `--release "${config.release}"`,
    `--dist "${config.dist}"`,
  ].join(" ");

  execSync(uploadCmd, { cwd: mobileDir, stdio: "inherit" });
}

function uploadSourcemaps({
  platform = "android",
  dryRun = false,
  mobileDir = path.resolve(__dirname, ".."),
} = {}) {
  const config = resolveConfig(mobileDir);
  const tempDir = path.join(mobileDir, ".sentry-temp");

  if (dryRun) {
    process.stdout.write(
      `[DRY RUN] Target: ${platform} | Release: ${config.release} | Dist: ${config.dist} | Org: ${config.org} | Project: ${config.project}\n`,
    );
    return;
  }

  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    const platforms = platform === "all" ? ["android", "ios"] : [platform];
    for (const targetPlatform of platforms) {
      const paths = bundlePlatform(mobileDir, tempDir, targetPlatform);
      uploadArtifacts(mobileDir, targetPlatform, paths, config);
    }
    process.stdout.write(`✨ Successfully uploaded source maps for ${config.release}!\n`);
  } finally {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const platformArgIndex = args.indexOf("--platform");
  const platform = platformArgIndex !== -1 ? args[platformArgIndex + 1] : "android";

  try {
    uploadSourcemaps({ platform, dryRun: isDryRun });
  } catch (error) {
    process.stderr.write(`❌ Error uploading source maps: ${error.message}\n`);
    process.exit(1);
  }
}

module.exports = {
  resolveConfig,
  uploadSourcemaps,
};
