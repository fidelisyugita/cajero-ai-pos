const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "../..");
const LOCAL_SCRIPT_PATTERN = /(?:^|\s|&&)\s*(?:node\s+)?(\.\/[^\s"']+\.(?:js|sh))/g;

function extractLocalScriptPaths(pkgPath) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const baseDir = path.dirname(pkgPath);
  const refs = [];

  for (const [name, command] of Object.entries(pkg.scripts || {})) {
    for (const match of command.matchAll(LOCAL_SCRIPT_PATTERN)) {
      refs.push({
        scriptName: name,
        relativePath: match[1],
        resolvedPath: path.resolve(baseDir, match[1]),
      });
    }
  }

  return refs;
}

test("all local script targets in root and mobile package.json exist", () => {
  const packageFiles = [
    path.join(repoRoot, "package.json"),
    path.join(repoRoot, "mobile/package.json"),
  ];

  for (const pkgPath of packageFiles) {
    const refs = extractLocalScriptPaths(pkgPath);
    assert.ok(refs.length > 0, `Expected local script references in ${pkgPath}`);

    for (const ref of refs) {
      assert.ok(
        fs.existsSync(ref.resolvedPath),
        `${path.relative(repoRoot, pkgPath)} script "${ref.scriptName}" references missing file ${ref.relativePath}`,
      );
    }
  }
});
