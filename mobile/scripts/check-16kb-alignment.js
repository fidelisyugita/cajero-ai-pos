const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const ELF_MAGIC = "7f454c46";
const TARGET_PAGE_SIZE = 16384; // 16 KB (0x4000)

/**
 * Checks an ELF binary buffer or file for 16 KB page-size alignment.
 * Android 15 & 16 require 64-bit binaries (arm64-v8a, x86_64) to have PT_LOAD segments aligned to >= 16 KB.
 *
 * @param {Buffer | string} input - Buffer or file path to ELF binary.
 * @returns {{ isElf: boolean, is64Bit: boolean, isCompliant: boolean, minAlignment: number, loadSegments: Array<object> }}
 */
function checkElfAlignment(input) {
  const buf = typeof input === "string" ? fs.readFileSync(input) : input;

  if (buf.length < 54 || buf.subarray(0, 4).toString("hex") !== ELF_MAGIC) {
    return {
      isElf: false,
      is64Bit: false,
      isCompliant: false,
      minAlignment: 0,
      loadSegments: [],
    };
  }

  const is64Bit = buf[4] === 2;
  // 32-bit binaries (armeabi-v7a, x86) are exempt from 16 KB page size requirement on Android
  if (!is64Bit) {
    return {
      isElf: true,
      is64Bit: false,
      isCompliant: true,
      minAlignment: 4096,
      loadSegments: [],
    };
  }

  const phoff = Number(buf.readBigUInt64LE(32));
  const phentsize = buf.readUInt16LE(54);
  const phnum = buf.readUInt16LE(56);

  const loadSegments = [];
  let isCompliant = true;
  let minAlignment = Infinity;

  for (let i = 0; i < phnum; i++) {
    const entryOffset = phoff + i * phentsize;
    if (entryOffset + phentsize > buf.length) {
      break;
    }

    const pType = buf.readUInt32LE(entryOffset);
    if (pType === 1) {
      // PT_LOAD segment
      const pOffset = Number(buf.readBigUInt64LE(entryOffset + 8));
      const pVaddr = Number(buf.readBigUInt64LE(entryOffset + 16));
      const pAlign = Number(buf.readBigUInt64LE(entryOffset + 48));

      const isAligned = pAlign >= TARGET_PAGE_SIZE && pVaddr % pAlign === pOffset % pAlign;
      if (!isAligned) {
        isCompliant = false;
      }
      if (pAlign < minAlignment) {
        minAlignment = pAlign;
      }

      loadSegments.push({
        offset: pOffset,
        vaddr: pVaddr,
        align: pAlign,
        isAligned,
      });
    }
  }

  return {
    isElf: true,
    is64Bit: true,
    isCompliant,
    minAlignment: minAlignment === Infinity ? 0 : minAlignment,
    loadSegments,
  };
}

/**
 * Recursively scans directory for .so files.
 */
function findSharedLibraries(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findSharedLibraries(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith(".so")) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Extracts and inspects shared libraries from an APK or AAB archive.
 */
function inspectArchive(archivePath) {
  const tmpDir = fs.mkdtempSync(path.join(require("node:os").tmpdir(), "cajero-16kb-"));
  try {
    execSync(`unzip -q "${archivePath}" "lib/*" -d "${tmpDir}"`, { stdio: "pipe" });
  } catch (_e) {
    // If no lib/ directory or unzip fails, return empty
  }

  const soFiles = findSharedLibraries(tmpDir);
  const results = soFiles.map((file) => {
    const relativeName = path.relative(tmpDir, file);
    const alignment = checkElfAlignment(file);
    return { file: relativeName, ...alignment };
  });

  fs.rmSync(tmpDir, { recursive: true, force: true });
  return results;
}

/**
 * Main inspection runner.
 */
function runCheck(targetPath) {
  let results = [];

  if (targetPath && fs.existsSync(targetPath)) {
    const stat = fs.statSync(targetPath);
    if (stat.isFile() && (targetPath.endsWith(".apk") || targetPath.endsWith(".aab"))) {
      process.stdout.write(`🔍 Inspecting Android package: ${targetPath}\n`);
      results = inspectArchive(targetPath);
    } else if (stat.isFile() && targetPath.endsWith(".so")) {
      results = [{ file: targetPath, ...checkElfAlignment(targetPath) }];
    } else if (stat.isDirectory()) {
      process.stdout.write(`🔍 Scanning directory for shared libraries: ${targetPath}\n`);
      const soFiles = findSharedLibraries(targetPath);
      results = soFiles.map((file) => ({
        file: path.relative(targetPath, file),
        ...checkElfAlignment(file),
      }));
    }
  } else {
    // Default search directories in React Native project
    const defaultSearchDirs = [
      path.resolve(__dirname, "../android/app/build/intermediates/merged_native_libs"),
      path.resolve(__dirname, "../android/app/build/intermediates/stripped_native_libs"),
      path.resolve(__dirname, "../builds"),
    ];

    for (const dir of defaultSearchDirs) {
      if (fs.existsSync(dir)) {
        const soFiles = findSharedLibraries(dir);
        for (const file of soFiles) {
          results.push({
            file: path.relative(dir, file),
            ...checkElfAlignment(file),
          });
        }
      }
    }
  }

  // Filter 64-bit binaries which are subject to 16 KB page-size enforcement
  const checked64Bit = results.filter((r) => r.is64Bit);
  const failed = checked64Bit.filter((r) => !r.isCompliant);

  process.stdout.write(
    `\n📋 16 KB Page-Size Verification Results (${checked64Bit.length} 64-bit libraries checked):\n`,
  );

  for (const item of checked64Bit) {
    const status = item.isCompliant ? "✅ PASS" : "❌ FAIL";
    const alignKb = item.minAlignment / 1024;
    process.stdout.write(`  ${status} [${alignKb} KB] ${item.file}\n`);
  }

  if (failed.length > 0) {
    process.stderr.write(
      `\n❌ ${failed.length} shared libraries violate Android 16 KB page-size alignment!\n`,
    );
    return false;
  }

  process.stdout.write(
    checked64Bit.length > 0
      ? "\n🎉 All 64-bit native libraries meet Android 16 (API 36) 16 KB page-size requirements.\n"
      : "\nℹ️  No 64-bit native binaries found in searched directories (build artifacts may not be generated yet).\n",
  );
  return true;
}

if (require.main === module) {
  const target = process.argv[2];
  const passed = runCheck(target);
  process.exit(passed ? 0 : 1);
}

module.exports = {
  checkElfAlignment,
  findSharedLibraries,
  runCheck,
  TARGET_PAGE_SIZE,
};
