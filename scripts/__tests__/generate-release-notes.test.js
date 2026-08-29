const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const {
  parseGitCommits,
  extractPrNumbers,
  formatReleaseNotes,
  generateReleaseNotes,
} = require("../generate-release-notes");

test("parseGitCommits parses conventional commits with types and scopes", () => {
  const rawLog = [
    "hash1\x1fshort1\x1fAuthor One\x1ffeat(mobile): add biometric authentication\x1fbody1\x1e",
    "hash2\x1fshort2\x1fAuthor Two\x1ffix: resolve memory leak on unmount\x1fbody2\x1e",
    "hash3\x1fshort3\x1fAuthor One\x1fMerge pull request #45 from branch\x1fmerge body\x1e",
    "hash4\x1fshort4\x1fAuthor Three\x1frefactor!: migrate to unistyles v3\x1fBREAKING CHANGE: theme structure changed\x1e",
  ].join("");

  const commits = parseGitCommits(rawLog);
  assert.strictEqual(commits.length, 3); // Merge commit skipped

  assert.strictEqual(commits[0].hash, "hash1");
  assert.strictEqual(commits[0].shortHash, "short1");
  assert.strictEqual(commits[0].type, "feat");
  assert.strictEqual(commits[0].scope, "mobile");
  assert.strictEqual(commits[0].description, "add biometric authentication");
  assert.strictEqual(commits[0].isBreaking, false);

  assert.strictEqual(commits[1].type, "fix");
  assert.strictEqual(commits[1].scope, null);
  assert.strictEqual(commits[1].description, "resolve memory leak on unmount");
  assert.strictEqual(commits[1].isBreaking, false);

  assert.strictEqual(commits[2].type, "refactor");
  assert.strictEqual(commits[2].description, "migrate to unistyles v3");
  assert.strictEqual(commits[2].isBreaking, true);
});

test("parseGitCommits returns empty array for empty input", () => {
  assert.deepStrictEqual(parseGitCommits(""), []);
  assert.deepStrictEqual(parseGitCommits(null), []);
});

test("extractPrNumbers extracts unique PR numbers", () => {
  const rawLog = "Merge pull request #45 from ... fix(#42): test ... (#45)";
  assert.deepStrictEqual(extractPrNumbers(rawLog), ["42", "45"]);
});

test("formatReleaseNotes formats markdown with highlights and categorized commits", () => {
  const commits = [
    {
      hash: "abc123456",
      shortHash: "abc1234",
      author: "Developer One",
      type: "feat",
      scope: "mobile",
      description: "support offline sync",
      isBreaking: false,
    },
    {
      hash: "def789012",
      shortHash: "def7890",
      author: "Developer Two",
      type: "fix",
      scope: null,
      description: "prevent crash on empty list",
      isBreaking: false,
    },
  ];

  const prSummaries = [
    {
      number: "46",
      title: "Setup EAS build and release tagging",
      url: "https://github.com/org/repo/pull/46",
      summaryBullets: ["Configured EAS profiles", "Added bump scripts"],
    },
  ];

  const output = formatReleaseNotes({
    workspace: "mobile",
    currentTag: "mobile-v1.1.0",
    previousTag: "mobile-v1.0.0",
    commits,
    prSummaries,
    repoSlug: "org/repo",
  });

  assert.ok(output.includes("## 📱 Release Notes: MOBILE v1.1.0"));
  assert.ok(output.includes("### 📋 Highlights & What's Changed"));
  assert.ok(output.includes("[#46](https://github.com/org/repo/pull/46)"));
  assert.ok(output.includes("Configured EAS profiles"));
  assert.ok(output.includes("### 🚀 Features"));
  assert.ok(output.includes("**mobile**: support offline sync"));
  assert.ok(output.includes("### 🐛 Bug Fixes"));
  assert.ok(output.includes("prevent crash on empty list"));
  assert.ok(output.includes("### 👥 Contributors"));
  assert.ok(output.includes("Developer One"));
  assert.ok(output.includes("https://github.com/org/repo/compare/mobile-v1.0.0...mobile-v1.1.0"));
});

test("generateReleaseNotes integration generates file", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rel-notes-test-"));
  const outputFile = path.join(tempDir, "release-notes.md");

  const mockLog = "hash1\x1fshort1\x1fDev\x1ffeat: new feature\x1fbody\x1e";
  const mockExec = (cmd) => {
    if (cmd.startsWith("git log")) return mockLog;
    if (cmd.startsWith("git tag")) return "";
    if (cmd.startsWith("git remote")) return "git@github.com:org/repo.git";
    return "";
  };

  const result = generateReleaseNotes({
    workspace: "mobile",
    currentTag: "mobile-v1.1.0",
    outputFile,
    exec: mockExec,
  });

  assert.strictEqual(result.commitCount, 1);
  assert.strictEqual(fs.existsSync(outputFile), true);
  const fileContent = fs.readFileSync(outputFile, "utf8");
  assert.ok(fileContent.includes("### 🚀 Features"));
  assert.ok(fileContent.includes("new feature"));

  fs.rmSync(tempDir, { recursive: true, force: true });
});
