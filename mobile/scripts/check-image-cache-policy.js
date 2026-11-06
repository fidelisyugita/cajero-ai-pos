#!/usr/bin/env node
/**
 * Image Cache Policy & Component Standard Checker.
 *
 * Enforces per .agents/rules/mobile.md §3.K:
 * 1. Prohibits cachePolicy="disk" (must use cachePolicy="memory-disk" for optimal mobile RAM/disk caching).
 * 2. Prohibits importing Image from "react-native" in app/ and components/ (must import from "expo-image").
 */

const fs = require("node:fs");
const path = require("node:path");

function scanFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "__tests__" && entry.name !== "node_modules") {
        scanFiles(fullPath, fileList);
      }
    } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function checkImageStandards({
  srcDirs = [path.resolve(__dirname, "../app"), path.resolve(__dirname, "../components")],
} = {}) {
  const allFiles = srcDirs.flatMap((dir) => scanFiles(dir));
  const errors = [];

  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      const relPath = path.relative(path.resolve(__dirname, ".."), filePath);

      if (/cachePolicy\s*=\s*["']disk["']/.test(line)) {
        errors.push(
          `[${relPath}:${lineNum}] Prohibited cachePolicy="disk". Use cachePolicy="memory-disk" per .agents/rules/mobile.md §3.K.`,
        );
      }

      if (
        /import\s+.*?\bImage\b.*?from\s+["']react-native["']/.test(line) &&
        !line.includes("ImageRequireSource")
      ) {
        errors.push(
          `[${relPath}:${lineNum}] Banned import of Image from "react-native". Always use Image from "expo-image" per .agents/rules/mobile.md §3.K.`,
        );
      }
    }
  }

  return {
    success: errors.length === 0,
    errors,
    checkedCount: allFiles.length,
  };
}

if (require.main === module) {
  const result = checkImageStandards();
  if (!result.success) {
    for (const err of result.errors) {
      process.stderr.write(`❌ ${err}\n`);
    }
    process.stderr.write("\n❌ Image standard violations found. Please fix the above errors.\n");
    process.exit(1);
  }
  process.stdout.write(
    `✅ Checked ${result.checkedCount} files. Image cachePolicy & expo-image standards satisfied.\n`,
  );
}

module.exports = { checkImageStandards };
