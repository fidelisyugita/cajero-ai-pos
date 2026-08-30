const fs = require("node:fs");
const path = require("node:path");

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

function getCliArgument(argName, args = process.argv.slice(2)) {
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === `--${argName}` && i + 1 < args.length) {
      return args[i + 1];
    }
    if (args[i].startsWith(`--${argName}=`)) {
      return args[i].split("=")[1];
    }
  }
  return undefined;
}

function resolveScannerConfig(options = {}) {
  const mobileDir = options.mobileDir || path.resolve(__dirname, "..");
  const args = options.args || process.argv.slice(2);
  const localEnv = parseEnvFile(path.join(mobileDir, ".env"));
  const rootEnv = parseEnvFile(path.join(mobileDir, "../.env"));

  const serverUrl =
    getCliArgument("server-url", args) ||
    process.env.SONAR_HOST_URL ||
    localEnv.SONAR_HOST_URL ||
    rootEnv.SONAR_HOST_URL ||
    "http://localhost:9000";

  const token =
    getCliArgument("token", args) ||
    process.env.SONAR_TOKEN ||
    process.env.SONARQUBE_TOKEN ||
    localEnv.SONAR_TOKEN ||
    localEnv.SONARQUBE_TOKEN ||
    rootEnv.SONAR_TOKEN ||
    rootEnv.SONARQUBE_TOKEN;

  return { mobileDir, serverUrl, token };
}

async function runSonarScan(options = {}) {
  const { mobileDir, serverUrl, token } = resolveScannerConfig(options);

  process.stdout.write("🔍 Starting SonarQube Scanner for Cajero Mobile...\n");
  process.stdout.write(`📡 Server URL: ${serverUrl}\n`);

  if (!token) {
    process.stdout.write(
      "\n⚠️  SONAR_TOKEN is not provided in environment or .env files.\n" +
        "   If your SonarQube server requires authentication:\n" +
        "   1. Open http://localhost:9000 in your browser (admin/admin)\n" +
        "   2. Go to My Account -> Security -> Generate Tokens\n" +
        "   3. Add SONAR_TOKEN=<your-token> to mobile/.env or pass --token=<token>\n\n",
    );
  }

  const coverageReportPath = path.join(mobileDir, "coverage", "lcov.info");
  if (fs.existsSync(coverageReportPath)) {
    process.stdout.write(`📊 Found coverage report at ${coverageReportPath}\n`);
  } else {
    process.stdout.write(
      `⚠️  No coverage report found at ${coverageReportPath}. Code coverage metrics will be omitted. Run 'yarn test:coverage' first to generate coverage.\n`,
    );
  }

  const scanOptions = {
    serverUrl,
    token: token || undefined,
    options: {
      "sonar.projectBaseDir": mobileDir,
      ...(token ? { "sonar.login": token, "sonar.token": token } : {}),
    },
  };

  try {
    let scanFn = options.scannerFn;
    if (!scanFn) {
      const scannerModule = await import("sonarqube-scanner");
      scanFn = scannerModule.scan;
    }
    await scanFn(scanOptions);
    process.stdout.write("\n✅ SonarQube analysis completed successfully!\n");
    process.stdout.write(`🌐 View results at: ${serverUrl}/dashboard?id=cajero-mobile\n\n`);
  } catch (error) {
    process.stderr.write(`\n❌ SonarQube analysis failed: ${error.message || error}\n`);
    process.stderr.write(
      "\n💡 Troubleshooting Tips:\n" +
        "  - Ensure the SonarQube container is running: run 'yarn sonarqube:status' or 'yarn sonarqube:start'\n" +
        "  - Ensure your SONAR_TOKEN is valid for the 'cajero-mobile' project\n" +
        "  - Check container logs with 'yarn sonarqube:logs'\n\n",
    );
    if (options.throwOnError) {
      throw error;
    }
    process.exit(1);
  }
}

if (require.main === module) {
  runSonarScan();
}

module.exports = {
  parseEnvFile,
  getCliArgument,
  resolveScannerConfig,
  runSonarScan,
};
