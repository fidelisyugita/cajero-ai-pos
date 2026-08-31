#!/usr/bin/env node
/**
 * AST-based i18n validator and hardcoded string detection tool for Cajero Mobile.
 *
 * Validates:
 * 1. Locale Key Parity (en.ts <-> id.ts bidirectional completeness).
 * 2. Invalid Key Usage (t("...") calls referencing undefined locale keys).
 * 3. Unused Locale Keys (locale keys declared but never referenced in codebase).
 * 4. Hardcoded JSX Text (<Text>Literal</Text>, <Button>Literal</Button>).
 * 5. Hardcoded User-Facing Props (title, label, placeholder, subtitle, etc.).
 * 6. Hardcoded Alert Messages (Alert.alert("Title", "Message")).
 *
 * Supports inline suppression via `// i18n-ignore` or `// i18n-ignore: <reason>`.
 */

const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const USER_FACING_PROPS = new Set([
  "title",
  "label",
  "placeholder",
  "subtitle",
  "headerTitle",
  "description",
  "message",
  "error",
  "emptyText",
  "confirmText",
  "cancelText",
  "badge",
  "hint",
  "actionText",
  "buttonText",
  "helperText",
  "loadingText",
]);

const TECHNICAL_PROPS_IGNORE = new Set([
  "testID",
  "key",
  "name",
  "style",
  "className",
  "contentFit",
  "cachePolicy",
  "resizeMode",
  "keyboardType",
  "autoCapitalize",
  "autoComplete",
  "textAlign",
  "size",
  "variant",
  "color",
  "id",
  "href",
  "fontFamily",
  "animationType",
  "role",
  "aria-label",
]);

const TECHNICAL_EXEMPT_PATTERNS = [
  /^https?:\/\//i,
  /^mailto:/i,
  /^tel:/i,
  /^\/(?:dashboard|modal|product|order|expense|receipt|business|report|settings|auth)\b/i,
  /\.(?:png|jpe?g|svg|webp|gif|json|pdf|db|ttf|otf)$/i,
  /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i,
  /^rgba?\(/i,
  /^(?:IDR|Rp|USD|EUR|GBP|JPY|SGD|AUD|MYR|THB|VND|PHP|CNY)$/i,
  /^[A-Z0-9_-]+$/,
];

const NUMBER_OR_PUNCTUATION_PATTERN = /^[\d\s.,:+\-%#/\\()_—–·*•~!?|&=<>@$[\]{}'"^`]+$/;

const I18N_IGNORE_PATTERN = /\/\/\s*i18n-ignore|\/\*\s*i18n-ignore/i;

/**
 * Checks if a string literal should be exempted from translation requirements.
 * @param {string} rawString
 * @returns {boolean}
 */
function isExemptString(rawString) {
  if (typeof rawString !== "string") return true;
  const trimmed = rawString.trim();
  if (!trimmed) return true;

  if (NUMBER_OR_PUNCTUATION_PATTERN.test(trimmed)) return true;

  for (const pattern of TECHNICAL_EXEMPT_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }

  return false;
}

/**
 * Checks if a given line index in the source file has an i18n suppression directive.
 * @param {string[]} lines
 * @param {number} zeroBasedLine
 * @returns {boolean}
 */
function hasI18nIgnoreDirective(lines, zeroBasedLine) {
  if (zeroBasedLine < 0 || zeroBasedLine >= lines.length) return false;

  if (I18N_IGNORE_PATTERN.test(lines[zeroBasedLine])) {
    return true;
  }

  if (zeroBasedLine > 0 && I18N_IGNORE_PATTERN.test(lines[zeroBasedLine - 1])) {
    return true;
  }

  return false;
}

/**
 * Extracts locale keys from a TypeScript locale definition file (e.g. en.ts or id.ts).
 * @param {string} sourceText
 * @param {string} filePath
 * @returns {Set<string>}
 */
function extractLocaleKeys(sourceText, filePath = "locale.ts") {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const keys = new Set();

  function walk(node) {
    if (ts.isExportAssignment(node) && ts.isObjectLiteralExpression(node.expression)) {
      for (const prop of node.expression.properties) {
        if (ts.isPropertyAssignment(prop)) {
          const propName = prop.name.getText(sourceFile).replace(/^['"]|['"]$/g, "");
          if (propName) {
            keys.add(propName);
          }
        }
      }
    }
    ts.forEachChild(node, walk);
  }

  walk(sourceFile);
  return keys;
}

/**
 * Compares two locale key sets and identifies parity discrepancies.
 * @param {Set<string>} enKeys
 * @param {Set<string>} idKeys
 * @returns {Array<{ rule: string, message: string, key: string, missingIn: string }>}
 */
function checkLocaleParity(enKeys, idKeys) {
  const violations = [];

  for (const key of enKeys) {
    if (!idKeys.has(key)) {
      violations.push({
        rule: "I18N_LOCALE_PARITY_MISSING",
        message: `Translation key "${key}" is defined in en.ts but missing in id.ts.`,
        key,
        missingIn: "id.ts",
      });
    }
  }

  for (const key of idKeys) {
    if (!enKeys.has(key)) {
      violations.push({
        rule: "I18N_LOCALE_PARITY_MISSING",
        message: `Translation key "${key}" is defined in id.ts but missing in en.ts.`,
        key,
        missingIn: "en.ts",
      });
    }
  }

  return violations;
}

/**
 * Finds keys declared in locale definitions that are never referenced in the scanned code.
 * @param {Set<string>} allLocaleKeys
 * @param {Set<string>} usedKeys
 * @returns {Array<{ rule: string, message: string, key: string }>}
 */
function findUnusedKeys(allLocaleKeys, usedKeys) {
  const violations = [];
  for (const key of allLocaleKeys) {
    if (!usedKeys.has(key)) {
      violations.push({
        rule: "I18N_UNUSED_LOCALE_KEY",
        message: `Translation key "${key}" is declared in locale dictionary but never used in codebase.`,
        key,
      });
    }
  }
  return violations;
}

/**
 * Inspects a TypeScript / TSX source file for i18n violations.
 * @param {string} sourceText
 * @param {string} filePath
 * @param {Set<string>|null} validKeys
 * @returns {{ violations: Array<any>, usedKeys: Set<string> }}
 */
function analyzeSource(sourceText, filePath, validKeys = null) {
  const isJsx = filePath.endsWith(".tsx") || filePath.endsWith(".jsx");
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    isJsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const lines = sourceText.split(/\r?\n/);
  const violations = [];
  const usedKeys = new Set();

  function checkStringLiteral(node, rule, makeMessage) {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    if (hasI18nIgnoreDirective(lines, line)) return;

    const rawValue = node.text;
    if (isExemptString(rawValue)) return;

    violations.push({
      line: line + 1,
      column: character + 1,
      rule,
      message: makeMessage(rawValue),
      lineContent: lines[line] || "",
    });
  }

  function walk(node) {
    // 1. Detect t("key") or i18n.t("key") calls
    if (ts.isCallExpression(node)) {
      const expr = node.expression;
      let isTCall = false;
      if (ts.isIdentifier(expr) && expr.text === "t") {
        isTCall = true;
      } else if (
        ts.isPropertyAccessExpression(expr) &&
        expr.name.text === "t" &&
        ts.isIdentifier(expr.expression) &&
        expr.expression.text === "i18n"
      ) {
        isTCall = true;
      }

      if (isTCall && node.arguments.length > 0) {
        const firstArg = node.arguments[0];
        if (ts.isStringLiteral(firstArg)) {
          const key = firstArg.text;
          usedKeys.add(key);

          if (validKeys && !validKeys.has(key)) {
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(
              firstArg.getStart(sourceFile),
            );
            if (!hasI18nIgnoreDirective(lines, line)) {
              violations.push({
                line: line + 1,
                column: character + 1,
                rule: "I18N_INVALID_KEY_REFERENCE",
                message: `Translation key "${key}" used in t() does not exist in locale dictionary.`,
                lineContent: lines[line] || "",
              });
            }
          }
        }
      }

      // 2. Detect Alert.alert("Title", "Message") calls
      if (
        ts.isPropertyAccessExpression(expr) &&
        expr.name.text === "alert" &&
        ts.isIdentifier(expr.expression) &&
        expr.expression.text === "Alert"
      ) {
        for (let i = 0; i < Math.min(2, node.arguments.length); i++) {
          const arg = node.arguments[i];
          if (ts.isStringLiteral(arg)) {
            checkStringLiteral(
              arg,
              "I18N_HARDCODED_ALERT",
              (val) => `Hardcoded string "${val}" in Alert.alert(). Use t("...") instead.`,
            );
          }
        }
      }
    }

    // 3. Detect hardcoded JSX Text elements: <Text>Hardcoded</Text>
    if (isJsx && ts.isJsxText(node)) {
      const text = node.getText(sourceFile);
      const trimmed = text.trim();
      if (trimmed && !isExemptString(trimmed)) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart(sourceFile),
        );
        if (!hasI18nIgnoreDirective(lines, line)) {
          violations.push({
            line: line + 1,
            column: character + 1,
            rule: "I18N_HARDCODED_JSX_TEXT",
            message: `Hardcoded JSX text "${trimmed}" detected. Wrap with t("...") or use localization.`,
            lineContent: lines[line] || "",
          });
        }
      }
    }

    // 4. Detect hardcoded String Literals inside JSX Expressions: <Text>{"Hardcoded"}</Text>
    if (
      isJsx &&
      ts.isJsxExpression(node) &&
      node.expression &&
      ts.isStringLiteral(node.expression) &&
      node.parent &&
      (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))
    ) {
      checkStringLiteral(
        node.expression,
        "I18N_HARDCODED_JSX_TEXT",
        (val) =>
          `Hardcoded JSX text "${val}" in expression. Wrap with t("...") or use localization.`,
      );
    }

    // 5. Detect hardcoded user-facing props: placeholder="Search", title="Submit"
    if (isJsx && ts.isJsxAttribute(node)) {
      const propName = node.name.getText(sourceFile);
      if (USER_FACING_PROPS.has(propName) && !TECHNICAL_PROPS_IGNORE.has(propName)) {
        if (node.initializer) {
          if (ts.isStringLiteral(node.initializer)) {
            checkStringLiteral(
              node.initializer,
              "I18N_HARDCODED_PROP",
              (val) => `Hardcoded string "${val}" in JSX prop "${propName}". Use t("...") instead.`,
            );
          } else if (
            ts.isJsxExpression(node.initializer) &&
            node.initializer.expression &&
            ts.isStringLiteral(node.initializer.expression)
          ) {
            checkStringLiteral(
              node.initializer.expression,
              "I18N_HARDCODED_PROP",
              (val) => `Hardcoded string "${val}" in JSX prop "${propName}". Use t("...") instead.`,
            );
          }
        }
      }
    }

    ts.forEachChild(node, walk);
  }

  walk(sourceFile);
  return { violations, usedKeys };
}

/**
 * Recursively collects target source files for i18n analysis.
 * @param {string} dir
 * @param {string[]} results
 */
function collectFiles(dir, results) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === "__tests__" ||
        entry.name === "locales" ||
        entry.name === "migrations" ||
        entry.name === ".maestro"
      ) {
        continue;
      }
      collectFiles(fullPath, results);
    } else if (entry.isFile()) {
      if (
        (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
        !entry.name.endsWith(".test.ts") &&
        !entry.name.endsWith(".test.tsx") &&
        !entry.name.endsWith(".d.ts")
      ) {
        results.push(fullPath);
      }
    }
  }
}

/**
 * Scans the mobile codebase for i18n compliance.
 * @param {string} rootDir
 * @param {object} options
 */
function scanCodebase(rootDir, options = {}) {
  const enLocalePath = path.resolve(rootDir, "services/locales/en.ts");
  const idLocalePath = path.resolve(rootDir, "services/locales/id.ts");

  let enKeys = new Set();
  let idKeys = new Set();

  const parityViolations = [];

  if (fs.existsSync(enLocalePath) && fs.existsSync(idLocalePath)) {
    enKeys = extractLocaleKeys(fs.readFileSync(enLocalePath, "utf-8"), "en.ts");
    idKeys = extractLocaleKeys(fs.readFileSync(idLocalePath, "utf-8"), "id.ts");
    parityViolations.push(...checkLocaleParity(enKeys, idKeys));
  }

  const allLocaleKeys = new Set([...enKeys, ...idKeys]);

  const targetDirs = ["app", "components", "services", "store", "hooks", "lib", "utils"];
  const targetFiles = [];

  for (const dir of targetDirs) {
    collectFiles(path.resolve(rootDir, dir), targetFiles);
  }

  const allUsedKeys = new Set();
  const fileViolations = [];

  for (const filePath of targetFiles) {
    const sourceText = fs.readFileSync(filePath, "utf-8");
    const { violations, usedKeys } = analyzeSource(sourceText, filePath, allLocaleKeys);

    for (const k of usedKeys) {
      allUsedKeys.add(k);
    }

    if (violations.length > 0) {
      const relPath = path.relative(rootDir, filePath);
      fileViolations.push({ file: relPath, violations });
    }
  }

  const unusedKeyViolations = options.ignoreUnused
    ? []
    : findUnusedKeys(allLocaleKeys, allUsedKeys);

  return {
    targetFilesCount: targetFiles.length,
    parityViolations,
    fileViolations,
    unusedKeyViolations,
    enKeysCount: enKeys.size,
    idKeysCount: idKeys.size,
    usedKeysCount: allUsedKeys.size,
  };
}

/**
 * Formats and prints scan results to stdout.
 */
function printReport(report, isQuiet = false) {
  let totalErrors = 0;

  if (report.parityViolations.length > 0) {
    process.stdout.write("\n\x1b[1m\x1b[31m--- Locale Key Parity Discrepancies ---\x1b[0m\n");
    for (const p of report.parityViolations) {
      totalErrors++;
      process.stdout.write(
        `  \x1b[31m[${p.rule}]\x1b[0m Missing in \x1b[36m${p.missingIn}\x1b[0m: "${p.key}"\n`,
      );
    }
  }

  if (report.fileViolations.length > 0) {
    if (!isQuiet) {
      process.stdout.write(
        "\n\x1b[1m\x1b[31m--- Hardcoded Strings & Translation Errors ---\x1b[0m\n",
      );
      for (const { file, violations } of report.fileViolations) {
        for (const v of violations) {
          totalErrors++;
          process.stdout.write(
            `  \x1b[36m${file}:${v.line}:${v.column}\x1b[0m \x1b[31m[${v.rule}]\x1b[0m ${v.message}\n`,
          );
          if (v.lineContent) {
            process.stdout.write(`    \x1b[90m${v.lineContent.trim()}\x1b[0m\n`);
          }
        }
      }
    } else {
      totalErrors += report.fileViolations.reduce((acc, f) => acc + f.violations.length, 0);
    }
  }

  if (report.unusedKeyViolations.length > 0) {
    process.stdout.write("\n\x1b[1m\x1b[33m--- Unused Locale Keys ---\x1b[0m\n");
    for (const u of report.unusedKeyViolations) {
      totalErrors++;
      process.stdout.write(
        `  \x1b[33m[${u.rule}]\x1b[0m "${u.key}" is declared in locale files but not used.\n`,
      );
    }
  }

  process.stdout.write("\n\x1b[1mi18n Linter Summary:\x1b[0m\n");
  process.stdout.write(`  Files Checked   : ${report.targetFilesCount}\n`);
  process.stdout.write(`  Locale Keys     : en=${report.enKeysCount}, id=${report.idKeysCount}\n`);
  process.stdout.write(`  Active Keys Used: ${report.usedKeysCount}\n`);

  if (totalErrors > 0) {
    process.stdout.write(`  Total Violations: \x1b[31m${totalErrors}\x1b[0m\n\n`);
  } else {
    process.stdout.write(
      "  Status          : \x1b[32mAll JSX strings and locale keys are verified!\x1b[0m\n\n",
    );
  }

  return totalErrors;
}

/**
 * CLI Runner
 */
function runCli(args = process.argv.slice(2)) {
  const isQuiet = args.includes("--quiet");
  const ignoreUnused = args.includes("--ignore-unused");
  const rootDir = process.cwd();

  const report = scanCodebase(rootDir, { ignoreUnused });
  const totalErrors = printReport(report, isQuiet);

  if (totalErrors > 0) {
    process.exit(1);
  }
}

module.exports = {
  USER_FACING_PROPS,
  TECHNICAL_PROPS_IGNORE,
  isExemptString,
  hasI18nIgnoreDirective,
  extractLocaleKeys,
  checkLocaleParity,
  findUnusedKeys,
  analyzeSource,
  scanCodebase,
  runCli,
};

if (require.main === module) {
  runCli();
}
