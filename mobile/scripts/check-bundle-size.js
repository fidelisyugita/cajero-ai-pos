const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const BUNDLE_PATH = "/tmp/index.android.bundle";
const MAP_PATH = "/tmp/index.android.bundle.map";
const ASSETS_PATH = "/tmp/test-assets";

// Budget threshold: 5.7 MB (5,700,000 bytes)
// Baseline before optimization: ~6,177,407 bytes (5.89 MB)
const BUDGET_BYTES = 5700000;

process.stdout.write("📦 Bundling production Android JS bundle with Metro...\n");
const startTime = Date.now();

try {
  execSync(
    `NODE_ENV=production yarn expo export:embed --platform android --dev false --entry-file index.ts --bundle-output ${BUNDLE_PATH} --sourcemap-output ${MAP_PATH} --assets-dest ${ASSETS_PATH}`,
    {
      cwd: path.resolve(__dirname, ".."),
      stdio: "pipe",
    },
  );
} catch (error) {
  process.stderr.write(`❌ Failed to generate Metro bundle: ${error.message}\n`);
  process.exit(1);
}

const duration = ((Date.now() - startTime) / 1000).toFixed(1);
const stats = fs.statSync(BUNDLE_PATH);
const sizeBytes = stats.size;
const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);

process.stdout.write(`⏱️  Bundle completed in ${duration}s\n`);
process.stdout.write(`📊 Bundle Size: ${sizeBytes} bytes (${sizeMB} MB)\n`);
process.stdout.write(
  `🎯 Target Budget: ${BUDGET_BYTES} bytes (${(BUDGET_BYTES / (1024 * 1024)).toFixed(2)} MB)\n`,
);

process.stdout.write("🧪 Testing Metro bundle syntax and structure...\n");
try {
  const vm = require("node:vm");
  const code = fs.readFileSync(BUNDLE_PATH, "utf8");
  new vm.Script(code);
  process.stdout.write("✅ Bundle script parses successfully without syntax errors.\n");
} catch (evalErr) {
  process.stderr.write(`❌ Bundle parse error: ${evalErr.message}\n`);
  process.exit(1);
}

if (fs.existsSync(MAP_PATH)) {
  try {
    const map = JSON.parse(fs.readFileSync(MAP_PATH, "utf8"));
    const packageSizes = {};
    for (let i = 0; i < map.sources.length; i++) {
      const source = map.sources[i];
      const content = map.sourcesContent?.[i] || "";
      const size = Buffer.byteLength(content, "utf8");

      let pkg = "app_code";
      const nmIndex = source.lastIndexOf("node_modules/");
      if (nmIndex !== -1) {
        const after = source.substring(nmIndex + "node_modules/".length);
        const parts = after.split("/");
        pkg = parts[0].startsWith("@") ? `${parts[0]}/${parts[1]}` : parts[0];
      }
      packageSizes[pkg] = (packageSizes[pkg] || 0) + size;
    }

    const sorted = Object.entries(packageSizes).sort((a, b) => b[1] - a[1]);
    process.stdout.write("\n🔍 Top 10 largest packages in bundle:\n");
    for (const [pkg, bytes] of sorted.slice(0, 10)) {
      process.stdout.write(`   - ${pkg.padEnd(30)}: ${(bytes / 1024).toFixed(1)} KB\n`);
    }
  } catch (err) {
    process.stderr.write(`Could not parse sourcemap for breakdown: ${err.message}\n`);
  }
}

if (sizeBytes > BUDGET_BYTES) {
  const excess = (sizeBytes - BUDGET_BYTES) / 1024;
  process.stderr.write(
    `\n❌ BUDGET EXCEEDED: Bundle is ${excess.toFixed(1)} KB over the limit of ${(BUDGET_BYTES / 1024).toFixed(1)} KB!\n`,
  );
  process.exit(1);
}

process.stdout.write("\n✅ Bundle size is within budget!\n");
process.exit(0);
