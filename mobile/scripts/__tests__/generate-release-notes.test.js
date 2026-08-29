const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const {
  parseGitCommits,
  extractPrNumbers,
  formatReleaseNotes,
  generateReleaseNotes,
} = require("../../../scripts/generate-release-notes");

describe("generate-release-notes script", () => {
  describe("parseGitCommits", () => {
    it("parses conventional commits with types and scopes", () => {
      const rawLog = [
        "hash1\x1fshort1\x1fAuthor One\x1ffeat(mobile): add biometric authentication\x1fbody1\x1e",
        "hash2\x1fshort2\x1fAuthor Two\x1ffix: resolve memory leak on unmount\x1fbody2\x1e",
        "hash3\x1fshort3\x1fAuthor One\x1fMerge pull request #45 from branch\x1fmerge body\x1e",
        "hash4\x1fshort4\x1fAuthor Three\x1frefactor!: migrate to unistyles v3\x1fBREAKING CHANGE: theme structure changed\x1e",
      ].join("");

      const commits = parseGitCommits(rawLog);
      expect(commits).toHaveLength(3); // Merge commit should be skipped

      expect(commits[0]).toMatchObject({
        hash: "hash1",
        shortHash: "short1",
        type: "feat",
        scope: "mobile",
        description: "add biometric authentication",
        isBreaking: false,
      });

      expect(commits[1]).toMatchObject({
        type: "fix",
        scope: null,
        description: "resolve memory leak on unmount",
        isBreaking: false,
      });

      expect(commits[2]).toMatchObject({
        type: "refactor",
        description: "migrate to unistyles v3",
        isBreaking: true,
      });
    });

    it("returns empty array for empty input", () => {
      expect(parseGitCommits("")).toEqual([]);
      expect(parseGitCommits(null)).toEqual([]);
    });
  });

  describe("extractPrNumbers", () => {
    it("extracts unique PR numbers from raw log", () => {
      const rawLog = "Merge pull request #45 from ... fix(#42): test ... (#45)";
      expect(extractPrNumbers(rawLog)).toEqual(["42", "45"]);
    });

    it("returns empty array when no PR numbers present", () => {
      expect(extractPrNumbers("feat: simple commit without pr")).toEqual([]);
    });
  });

  describe("formatReleaseNotes", () => {
    it("formats markdown with highlights, categorized commits, and contributors", () => {
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

      expect(output).toContain("## 📱 Release Notes: MOBILE v1.1.0");
      expect(output).toContain("### 📋 Highlights & What's Changed");
      expect(output).toContain("[#46](https://github.com/org/repo/pull/46)");
      expect(output).toContain("Configured EAS profiles");
      expect(output).toContain("### 🚀 Features");
      expect(output).toContain("**mobile**: support offline sync");
      expect(output).toContain("### 🐛 Bug Fixes");
      expect(output).toContain("prevent crash on empty list");
      expect(output).toContain("### 👥 Contributors");
      expect(output).toContain("Developer One");
      expect(output).toContain("https://github.com/org/repo/compare/mobile-v1.0.0...mobile-v1.1.0");
    });
  });

  describe("generateReleaseNotes integration", () => {
    it("generates markdown and writes to output file if provided", () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rel-notes-test-"));
      const outputFile = path.join(tempDir, "release-notes.md");

      const mockLog = "hash1\x1fshort1\x1fDev\x1ffeat: new feature\x1fbody\x1e";
      const mockExec = jest.fn((cmd) => {
        if (cmd.startsWith("git log")) return mockLog;
        if (cmd.startsWith("git tag")) return "";
        if (cmd.startsWith("git remote")) return "git@github.com:org/repo.git";
        return "";
      });

      const result = generateReleaseNotes({
        workspace: "mobile",
        currentTag: "mobile-v1.1.0",
        outputFile,
        exec: mockExec,
      });

      expect(result.commitCount).toBe(1);
      expect(fs.existsSync(outputFile)).toBe(true);
      const fileContent = fs.readFileSync(outputFile, "utf8");
      expect(fileContent).toContain("### 🚀 Features");
      expect(fileContent).toContain("new feature");

      fs.rmSync(tempDir, { recursive: true, force: true });
    });
  });
});
