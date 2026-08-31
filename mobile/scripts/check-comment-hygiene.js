#!/usr/bin/env node
/**
 * Deterministic Code Hygiene & AI Comment Checker for Cajero Mobile.
 *
 * Enforces:
 * 1. Ban on AI syntax-narration comments (e.g. "// set state", "// handle click", "// return JSX").
 * 2. Mandatory rationale with min length (>= 15 chars) on all suppression directives (biome-ignore, ts-ignore).
 * 3. Ban on redundant comments in trivial functions (complexity <= 2).
 * 4. Comment-to-code signal density threshold (max 25% inline narration per file/function).
 *
 * Supports auto-fixing via `--fix`.
 */

const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const BANNED_SYNTAX_NARRATION_PATTERNS = [
  /^\/\/\s*(?:set|update|reset|initialize|declare|define)\s+(?:state|variable|val|value|store|ref|data)\b/i,
  /^\/\/\s*(?:handle|on|trigger)\s+(?:click|submit|press|change|select|close|open|cancel|save|delete|search|scroll|input|event)\b/i,
  /^\/\/\s*(?:return|render)\s+(?:jsx|view|component|ui|element|screen|layout|null|empty|fallback)\b/i,
  /^\/\/\s*(?:fetch|call|trigger|execute)\s+(?:api|data|endpoint|query|mutation|service|function)\b/i,
  /^\/\/\s*(?:use\s*effect|use\s*state|use\s*memo|use\s*callback|effect\s+hook|state\s+hook|react\s+hook)\b/i,
  /^\/\/\s*(?:import|export)\s+(?:components?|hooks?|services?|utils?|types?|constants?|styles?)\b/i,
  /^\/\/\s*(?:helper|utility)\s+(?:functions?|methods?|helpers?)\b/i,
  /^\/\/\s*step\s*\d+\s*:\s*(?:initialize|do|run|set|check|call|get|create|handle)/i,
  /^\/\/\s*(?:destructure|destructuring|extract)\s+(?:props|state|values|data|params)\b/i,
  /^\/\/\s*(?:check\s+if|verify\s+if)\s+(?:user|data|value|item|state|prop|id)\s+(?:exists?|is\s+valid|is\s+null|is\s+empty)\b/i,
  /^\/\/\s*(?:navigate|redirect)\s+to\s+(?:screen|page|route|home|details|dashboard)\b/i,
  /^\/\/\s*(?:log|print|console)\s+(?:error|message|debug|info|response)\b/i,
];

const ARCHITECTURAL_EXEMPTION_PATTERNS = [
  /(?:https?:\/\/|#\d+|\bTODO\b|\bFIXME\b|\bNOTE\b|\bHACK\b|\bBLE\b|\bBluetooth\b|\bprinter\b|\besc-pos\b|\bSQLite\b|\bDrizzle\b|\bZustand\b|\breanimated\b|\bworklet\b|\bworkaround\b|\brace condition\b|\bmemory leak\b|\bhardware\b|\bdevice\b|\bAndroid\b|\biOS\b|\bExpo\b)/i,
];

const SUPPRESSION_DIRECTIVE_PATTERN =
  /^\/\/\s*(?:biome-ignore|@ts-ignore|@ts-expect-error|eslint-disable(?:-next-line)?)\s*(.*)$/i;

const MIN_SUPPRESSION_RATIONALE_LENGTH = 15;
const MAX_INLINE_COMMENT_DENSITY = 0.25;

/**
 * Check if a single-line comment is banned syntax narration.
 * @param {string} commentText
 * @returns {boolean}
 */
function isBannedSyntaxNarration(commentText) {
  const trimmed = commentText.trim();
  if (!trimmed.startsWith("//")) return false;

  for (const exemptPattern of ARCHITECTURAL_EXEMPTION_PATTERNS) {
    if (exemptPattern.test(trimmed)) return false;
  }

  for (const bannedPattern of BANNED_SYNTAX_NARRATION_PATTERNS) {
    if (bannedPattern.test(trimmed)) return true;
  }

  return false;
}

/**
 * Validates biome-ignore directive rationale.
 * @param {string} content
 * @returns {{ isValid: boolean, reason?: string }}
 */
function validateBiomeSuppression(content) {
  const parts = content.split(":");
  if (parts.length < 2 || !parts[1].trim()) {
    return {
      isValid: false,
      reason:
        "biome-ignore requires a rationale (format: '// biome-ignore rule: <explanation >= 15 chars>')",
    };
  }
  const explanation = parts.slice(1).join(":").trim();
  if (explanation.length < MIN_SUPPRESSION_RATIONALE_LENGTH) {
    return {
      isValid: false,
      reason: `biome-ignore explanation too short (${explanation.length} chars, min ${MIN_SUPPRESSION_RATIONALE_LENGTH} required): "${explanation}"`,
    };
  }
  return { isValid: true };
}

/**
 * Validates TypeScript suppression directive rationale.
 * @param {string} content
 * @returns {{ isValid: boolean, reason?: string }}
 */
function validateTsSuppression(content) {
  const cleanContent = content
    .replace(/^@ts-(?:ignore|expect-error)\s*/i, "")
    .replace(/^[-:]\s*/, "")
    .trim();
  if (cleanContent.length < MIN_SUPPRESSION_RATIONALE_LENGTH) {
    return {
      isValid: false,
      reason: `@ts-ignore requires an explanation >= 15 chars (provided: "${cleanContent}")`,
    };
  }
  return { isValid: true };
}

/**
 * Validates suppression comments (biome-ignore, ts-ignore).
 * @param {string} commentText
 * @returns {{ isValid: boolean, reason?: string }}
 */
function validateSuppressionComment(commentText) {
  const match = commentText.trim().match(SUPPRESSION_DIRECTIVE_PATTERN);
  if (!match) return { isValid: true };

  const content = match[1].trim();

  if (commentText.includes("biome-ignore")) {
    return validateBiomeSuppression(content);
  }

  if (commentText.includes("@ts-ignore") || commentText.includes("@ts-expect-error")) {
    return validateTsSuppression(content);
  }

  return { isValid: true };
}

/**
 * Helper to check if binary expression contributes to complexity.
 * @param {ts.BinaryExpression} binExpr
 * @returns {boolean}
 */
function isComplexityBinaryOp(binExpr) {
  const kind = binExpr.operatorToken.kind;
  return (
    kind === ts.SyntaxKind.AmpersandAmpersandToken ||
    kind === ts.SyntaxKind.BarBarToken ||
    kind === ts.SyntaxKind.QuestionQuestionToken
  );
}

/**
 * Calculates basic cyclomatic complexity for a function AST node.
 * @param {ts.Node} node
 * @returns {number}
 */
function calculateNodeComplexity(node) {
  let complexity = 1;

  function walk(child) {
    switch (child.kind) {
      case ts.SyntaxKind.IfStatement:
      case ts.SyntaxKind.ConditionalExpression:
      case ts.SyntaxKind.CaseClause:
      case ts.SyntaxKind.CatchClause:
      case ts.SyntaxKind.WhileStatement:
      case ts.SyntaxKind.DoStatement:
      case ts.SyntaxKind.ForStatement:
      case ts.SyntaxKind.ForInStatement:
      case ts.SyntaxKind.ForOfStatement:
        complexity += 1;
        break;
      case ts.SyntaxKind.BinaryExpression:
        if (isComplexityBinaryOp(child)) {
          complexity += 1;
        }
        break;
      default:
        break;
    }
    ts.forEachChild(child, walk);
  }

  ts.forEachChild(node, walk);
  return complexity;
}

/**
 * Scans single-line comment token.
 */
function processSingleLineCommentToken(commentText, pos, sourceFile, lines, violations) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
  const lineContent = lines[line] || "";

  const isSuppression =
    commentText.includes("biome-ignore") ||
    commentText.includes("@ts-ignore") ||
    commentText.includes("@ts-expect-error") ||
    commentText.includes("eslint-disable");

  if (isSuppression) {
    const suppressionCheck = validateSuppressionComment(commentText);
    if (!suppressionCheck.isValid) {
      violations.push({
        line: line + 1,
        column: character + 1,
        rule: "HYGIENE_SUPPRESSION_RATIONALE",
        message: suppressionCheck.reason,
        lineContent,
        isFixable: false,
      });
    }
    return false;
  }

  if (isBannedSyntaxNarration(commentText)) {
    violations.push({
      line: line + 1,
      column: character + 1,
      rule: "HYGIENE_SYNTAX_NARRATION",
      message: `Redundant syntax narration comment detected: "${commentText.trim()}". Comments must focus on architectural rationale or domain constraints.`,
      lineContent,
      isFixable: true,
    });
  }
  return true;
}

/**
 * Scans multiline comment token.
 */
function processMultiLineCommentToken(commentText, pos, sourceFile, lines, violations) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
  const lineContent = lines[line] || "";

  if (commentText.includes("biome-ignore") || commentText.includes("eslint-disable")) {
    const suppressionCheck = validateSuppressionComment(commentText);
    if (!suppressionCheck.isValid) {
      violations.push({
        line: line + 1,
        column: character + 1,
        rule: "HYGIENE_SUPPRESSION_RATIONALE",
        message: suppressionCheck.reason,
        lineContent,
        isFixable: false,
      });
    }
  }
}

/**
 * Scans comment trivia from source text.
 */
function scanCommentTrivia(sourceFile, sourceText, lines, violations) {
  const scanner = ts.createScanner(
    ts.ScriptTarget.Latest,
    false,
    ts.LanguageVariant.Standard,
    sourceText,
  );
  let token = scanner.scan();
  let inlineCommentCount = 0;

  while (token !== ts.SyntaxKind.EndOfFileToken) {
    if (token === ts.SyntaxKind.SingleLineCommentTrivia) {
      const isInline = processSingleLineCommentToken(
        scanner.getTokenText(),
        scanner.getTokenPos(),
        sourceFile,
        lines,
        violations,
      );
      if (isInline) inlineCommentCount += 1;
    } else if (token === ts.SyntaxKind.MultiLineCommentTrivia) {
      processMultiLineCommentToken(
        scanner.getTokenText(),
        scanner.getTokenPos(),
        sourceFile,
        lines,
        violations,
      );
    }
    token = scanner.scan();
  }

  return inlineCommentCount;
}

/**
 * Counts non-empty non-comment code lines.
 */
function countCodeLines(lines) {
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.startsWith("//") &&
      !trimmed.startsWith("/*") &&
      !trimmed.startsWith("*")
    ) {
      count += 1;
    }
  }
  return count;
}

/**
 * Counts discrete comment blocks in a block of lines.
 */
function countDiscreteCommentBlocks(fnLines) {
  let discreteBlocks = 0;
  let inBlock = false;

  for (const fnLine of fnLines) {
    const trimmed = fnLine.trim();
    if (trimmed.startsWith("//")) {
      if (!inBlock) {
        discreteBlocks += 1;
        inBlock = true;
      }
    } else {
      inBlock = false;
    }
  }

  return discreteBlocks;
}

/**
 * Checks function AST node for comment bloat.
 */
function checkFunctionNode(node, sourceFile, lines, violations) {
  const complexity = calculateNodeComplexity(node);
  const startPos = node.getStart(sourceFile);
  const endPos = node.getEnd();
  const { line: startLine } = sourceFile.getLineAndCharacterOfPosition(startPos);
  const { line: endLine } = sourceFile.getLineAndCharacterOfPosition(endPos);
  const fnLines = lines.slice(startLine, endLine + 1);

  if (complexity <= 2 && fnLines.length <= 10) {
    const discreteBlocks = countDiscreteCommentBlocks(fnLines);
    if (discreteBlocks >= 3) {
      violations.push({
        line: startLine + 1,
        column: 1,
        rule: "HYGIENE_TRIVIAL_FUNCTION",
        message: `Trivial function (complexity ${complexity}, ${fnLines.length} lines) has excessive separate comment blocks (${discreteBlocks} blocks). Simplify function and remove line-by-line commentary.`,
        lineContent: fnLines[0],
        isFixable: false,
      });
    }
  }
}

/**
 * Determines compiler script options from filename.
 */
function getScriptOptions(fileName) {
  const isTsx = fileName.endsWith(".tsx");
  const isJsx = fileName.endsWith(".jsx");
  const isTs = fileName.endsWith(".ts");
  const target = isTsx || isJsx ? ts.ScriptTarget.Latest : ts.ScriptTarget.ES2022;

  let kind = ts.ScriptKind.JS;
  if (isTsx) {
    kind = ts.ScriptKind.TSX;
  } else if (isTs) {
    kind = ts.ScriptKind.TS;
  } else if (isJsx) {
    kind = ts.ScriptKind.JSX;
  }

  return { target, kind };
}

/**
 * Checks comment density ratio on a file.
 */
function checkCommentDensity(inlineCommentCount, lines, violations) {
  const codeLineCount = countCodeLines(lines);
  if (codeLineCount < 20) return;

  const inlineRatio = inlineCommentCount / (codeLineCount + inlineCommentCount);
  if (inlineRatio > MAX_INLINE_COMMENT_DENSITY) {
    violations.push({
      line: 1,
      column: 1,
      rule: "HYGIENE_COMMENT_DENSITY",
      message: `High inline comment density (${(inlineRatio * 100).toFixed(1)}% comments, max allowed: ${MAX_INLINE_COMMENT_DENSITY * 100}%). Replace narrative inline comments with concise code or JSDoc module summaries.`,
      lineContent: lines[0] || "",
      isFixable: false,
    });
  }
}

/**
 * Traverses AST to check functions.
 */
function checkFunctions(sourceFile, lines, violations) {
  function visit(node) {
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isMethodDeclaration(node)
    ) {
      checkFunctionNode(node, sourceFile, lines, violations);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

/**
 * Analyzes source code for comment hygiene issues.
 * @param {string} sourceText
 * @param {string} fileName
 * @returns {{ violations: Array<{ line: number, column: number, rule: string, message: string, lineContent: string, isFixable: boolean }> }}
 */
function analyzeSource(sourceText, fileName = "file.tsx") {
  const violations = [];
  const { target, kind } = getScriptOptions(fileName);
  const sourceFile = ts.createSourceFile(fileName, sourceText, target, true, kind);
  const lines = sourceText.split("\n");

  const inlineCommentCount = scanCommentTrivia(sourceFile, sourceText, lines, violations);
  checkCommentDensity(inlineCommentCount, lines, violations);
  checkFunctions(sourceFile, lines, violations);

  return { violations };
}

/**
 * Strips fixable line comment.
 */
function stripLineComment(line) {
  const trimmed = line.trim();
  if (trimmed.startsWith("//")) {
    return null;
  }
  const commentIndex = line.indexOf("//");
  if (commentIndex > 0) {
    return line.substring(0, commentIndex).trimEnd();
  }
  return line;
}

/**
 * Strips fixable syntax narration comments from source code.
 * @param {string} sourceText
 * @param {string} fileName
 * @returns {{ fixedText: string, fixedCount: number }}
 */
function fixSource(sourceText, fileName = "file.tsx") {
  const { violations } = analyzeSource(sourceText, fileName);
  const fixableLines = new Set(
    violations
      .filter((v) => v.isFixable && v.rule === "HYGIENE_SYNTAX_NARRATION")
      .map((v) => v.line - 1),
  );

  if (fixableLines.size === 0) {
    return { fixedText: sourceText, fixedCount: 0 };
  }

  const lines = sourceText.split("\n");
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    if (fixableLines.has(i)) {
      const stripped = stripLineComment(lines[i]);
      if (stripped !== null) {
        newLines.push(stripped);
      }
    } else {
      newLines.push(lines[i]);
    }
  }

  return {
    fixedText: newLines.join("\n"),
    fixedCount: fixableLines.size,
  };
}

const IGNORE_DIR_NAMES = new Set([
  "node_modules",
  ".expo",
  "android",
  "ios",
  "dist",
  "coverage",
  ".git",
  ".yarn",
  "migrations",
]);

function isTargetSourceFile(name) {
  const ext = path.extname(name);
  return (
    (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx") && !name.endsWith(".d.ts")
  );
}

/**
 * Recursively scans directory for TypeScript / JavaScript files.
 * @param {string} dir
 * @param {string[]} fileList
 * @returns {string[]}
 */
function collectFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !IGNORE_DIR_NAMES.has(entry.name)) {
      collectFiles(fullPath, fileList);
    } else if (entry.isFile() && isTargetSourceFile(entry.name)) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

/**
 * Processes a single file for CLI.
 */
function processSingleFile(filePath, rootDir, isFix, isQuiet) {
  const relPath = path.relative(rootDir, filePath);
  const content = fs.readFileSync(filePath, "utf8");
  let fixedCount = 0;

  if (isFix) {
    const fixResult = fixSource(content, filePath);
    if (fixResult.fixedCount > 0) {
      fs.writeFileSync(filePath, fixResult.fixedText, "utf8");
      fixedCount = fixResult.fixedCount;
      if (!isQuiet) {
        process.stdout.write(
          `\x1b[32m[FIXED]\x1b[0m ${relPath} (${fixedCount} redundant comments stripped)\n`,
        );
      }
    }
  }

  const currentContent = fs.readFileSync(filePath, "utf8");
  const { violations } = analyzeSource(currentContent, filePath);

  return { relPath, fixedCount, violations };
}

/**
 * Prints violation details to console.
 */
function printViolations(violationFiles) {
  process.stdout.write("\n\x1b[1m\x1b[31m--- Code Hygiene Violations ---\x1b[0m\n\n");
  for (const { file, violations } of violationFiles) {
    for (const v of violations) {
      process.stdout.write(
        `  \x1b[36m${file}:${v.line}:${v.column}\x1b[0m \x1b[31m[${v.rule}]\x1b[0m ${v.message}\n`,
      );
      if (v.lineContent) {
        process.stdout.write(`    \x1b[90m${v.lineContent.trim()}\x1b[0m\n`);
      }
    }
  }
}

/**
 * Resolves target files for CLI run.
 */
function resolveTargetFiles(customFiles, rootDir) {
  if (customFiles.length > 0) {
    return customFiles.map((f) => path.resolve(rootDir, f));
  }
  const targetDirs = [
    "app",
    "components",
    "services",
    "store",
    "db",
    "lib",
    "utils",
    "hooks",
    "scripts",
  ];
  const targetFiles = [];
  for (const d of targetDirs) {
    const fullDir = path.resolve(rootDir, d);
    if (fs.existsSync(fullDir)) {
      collectFiles(fullDir, targetFiles);
    }
  }
  return targetFiles;
}

/**
 * Prints final hygiene summary.
 */
function printSummary(targetFilesCount, totalFixed, totalViolations, isQuiet) {
  if (isQuiet) return;
  const fixedMsg = totalFixed > 0 ? `Fixed \x1b[32m${totalFixed}\x1b[0m comments. ` : "";
  const statusMsg =
    totalViolations > 0
      ? `Found \x1b[31m${totalViolations}\x1b[0m violation(s).`
      : "\x1b[32mAll comments & suppressions conform to hygiene standards.\x1b[0m";
  process.stdout.write(
    `\n\x1b[1mHygiene Summary:\x1b[0m Checked ${targetFilesCount} files. ${fixedMsg}${statusMsg}\n`,
  );
}

/**
 * CLI Runner
 */
function runCli(args = process.argv.slice(2)) {
  const isFix = args.includes("--fix");
  const isQuiet = args.includes("--quiet");
  const customFiles = args.filter((a) => !a.startsWith("--"));
  const rootDir = process.cwd();
  const targetFiles = resolveTargetFiles(customFiles, rootDir);

  let totalViolations = 0;
  let totalFixed = 0;
  const violationFiles = [];

  for (const filePath of targetFiles) {
    const { relPath, fixedCount, violations } = processSingleFile(
      filePath,
      rootDir,
      isFix,
      isQuiet,
    );
    totalFixed += fixedCount;
    if (violations.length > 0) {
      totalViolations += violations.length;
      violationFiles.push({ file: relPath, violations });
    }
  }

  if (!isQuiet && violationFiles.length > 0) {
    printViolations(violationFiles);
  }

  printSummary(targetFiles.length, totalFixed, totalViolations, isQuiet);

  if (totalViolations > 0) {
    process.exit(1);
  }
}

module.exports = {
  isBannedSyntaxNarration,
  validateSuppressionComment,
  calculateNodeComplexity,
  analyzeSource,
  fixSource,
  runCli,
};

if (require.main === module) {
  runCli();
}
