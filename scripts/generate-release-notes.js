const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Maps commit type prefixes to category headings and emoji icons.
 */
const CATEGORIES = {
  breaking: { title: "💥 Breaking Changes", priority: 1 },
  feat: { title: "🚀 Features", priority: 2 },
  fix: { title: "🐛 Bug Fixes", priority: 3 },
  perf: { title: "⚡ Performance Improvements", priority: 4 },
  refactor: { title: "🔨 Refactoring & Code Quality", priority: 5 },
  chore: { title: "🧹 Chores & Maintenance", priority: 6 },
  ci: { title: "🧪 CI/CD & Build Infrastructure", priority: 7 },
  test: { title: "🧪 Tests", priority: 8 },
  docs: { title: "📚 Documentation", priority: 9 },
  other: { title: "📦 Other Changes", priority: 10 },
};

/**
 * Parses raw git log string into structured commit objects.
 */
function parseGitCommits(rawLog) {
  if (!rawLog || !rawLog.trim()) return [];

  const rawEntries = rawLog.split("\x1e").filter((e) => e.trim().length > 0);
  const commits = [];

  for (const entry of rawEntries) {
    const [hash, shortHash, author, subject, body] = entry.split("\x1f").map((s) => s ? s.trim() : "");
    if (!hash || !subject) continue;

    // Skip merge commits from commit categories
    if (/^Merge (pull request|branch)/i.test(subject)) {
      continue;
    }

    const conventionalMatch = subject.match(/^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/);
    let type = "other";
    let scope = null;
    let isBreaking = false;
    let description = subject;

    if (conventionalMatch) {
      type = conventionalMatch[1].toLowerCase();
      scope = conventionalMatch[2] || null;
      isBreaking = Boolean(conventionalMatch[3]);
      description = conventionalMatch[4];
    }

    if (body && /BREAKING[ -]CHANGE:/i.test(body)) {
      isBreaking = true;
    }

    commits.push({
      hash,
      shortHash,
      author,
      subject,
      description,
      type,
      scope,
      isBreaking,
      body: body || "",
    });
  }

  return commits;
}

/**
 * Extracts PR numbers from merge commits and commit messages.
 */
function extractPrNumbers(rawLog) {
  if (!rawLog) return [];
  const matches = rawLog.match(/#(\d+)/g) || [];
  const prNumbers = [...new Set(matches.map((m) => m.replace("#", "")))];
  return prNumbers.sort((a, b) => Number(a) - Number(b));
}

/**
 * Fetches PR details using `gh` CLI if available.
 */
function fetchPrSummary(prNumber, exec = execSync) {
  try {
    const rawJson = exec(`gh pr view ${prNumber} --json title,body,author,url`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    const data = JSON.parse(rawJson);
    const summaryLines = [];

    if (data.body) {
      const summaryMatch = data.body.match(/## Summary\s*([\s\S]*?)(?:\n## |$)/i);
      const textToScan = summaryMatch ? summaryMatch[1] : data.body;
      const lines = textToScan.split("\n").map((l) => l.trim());
      for (const line of lines) {
        if (line.startsWith("- ") || line.startsWith("* ")) {
          summaryLines.push(line.replace(/^[-*]\s*/, ""));
        }
      }
    }

    return {
      number: prNumber,
      title: data.title,
      url: data.url,
      author: data.author?.login || "",
      summaryBullets: summaryLines.slice(0, 4),
    };
  } catch {
    return null;
  }
}

/**
 * Detects git repository slug (owner/repo).
 */
function detectRepoSlug(exec = execSync) {
  try {
    const remoteUrl = exec("git remote get-url origin", { encoding: "utf8" }).trim();
    const match = remoteUrl.match(/[:/]([^/]+\/[^/.]+)(?:\.git)?$/);
    if (match) return match[1];
  } catch {
    // ignore
  }
  return "fidelisyugita/cajero-ai-pos";
}

/**
 * Finds the previous release tag for the given workspace.
 */
function findPreviousTag(workspace, currentTag, exec = execSync) {
  try {
    const rawTags = exec(`git tag -l "${workspace}-v*" --sort=-creatordate`, {
      encoding: "utf8",
    }).trim().split("\n").map((t) => t.trim()).filter(Boolean);

    const filteredTags = rawTags.filter((t) => t !== currentTag);
    return filteredTags.length > 0 ? filteredTags[0] : null;
  } catch {
    return null;
  }
}

/**
 * Formats grouped commits and PR summaries into Markdown release notes.
 */
function formatReleaseNotes({
  workspace,
  currentTag,
  previousTag,
  commits,
  prSummaries = [],
  repoSlug,
}) {
  const lines = [];
  const version = currentTag.replace(new RegExp(`^${workspace}-v`), "v");

  lines.push(`## 📱 Release Notes: ${workspace.toUpperCase()} ${version}`);
  lines.push("");

  // Section 1: Highlights & PR Summaries
  if (prSummaries.length > 0) {
    lines.push("### 📋 Highlights & What's Changed");
    for (const pr of prSummaries) {
      lines.push(`- **[#${pr.number}](${pr.url})**: ${pr.title}`);
      if (pr.summaryBullets && pr.summaryBullets.length > 0) {
        for (const bullet of pr.summaryBullets) {
          lines.push(`  - ${bullet}`);
        }
      }
    }
    lines.push("");
  }

  // Group commits by category
  const groups = {};
  for (const commit of commits) {
    let catKey = commit.type;
    if (commit.isBreaking) {
      catKey = "breaking";
    } else if (!CATEGORIES[catKey]) {
      catKey = "other";
    }
    if (!groups[catKey]) groups[catKey] = [];
    groups[catKey].push(commit);
  }

  const sortedCatKeys = Object.keys(groups).sort(
    (a, b) => (CATEGORIES[a]?.priority || 99) - (CATEGORIES[b]?.priority || 99),
  );

  for (const catKey of sortedCatKeys) {
    const category = CATEGORIES[catKey] || { title: `📦 ${catKey}` };
    lines.push(`### ${category.title}`);
    for (const item of groups[catKey]) {
      const scopePrefix = item.scope ? `**${item.scope}**: ` : "";
      const commitLink = `[\`${item.shortHash}\`](https://github.com/${repoSlug}/commit/${item.hash})`;
      lines.push(`- ${scopePrefix}${item.description} (${commitLink})`);
    }
    lines.push("");
  }

  // Contributors Section
  const authors = [...new Set(commits.map((c) => c.author).filter(Boolean))];
  if (authors.length > 0) {
    lines.push("### 👥 Contributors");
    for (const author of authors) {
      lines.push(`- ${author}`);
    }
    lines.push("");
  }

  // Changelog link
  lines.push("---");
  if (previousTag) {
    lines.push(`**Full Changelog**: https://github.com/${repoSlug}/compare/${previousTag}...${currentTag}`);
  } else {
    lines.push(`**Full Changelog**: https://github.com/${repoSlug}/commits/${currentTag}`);
  }

  return lines.join("\n");
}

/**
 * Main generator function.
 */
function generateReleaseNotes({
  workspace = "mobile",
  currentTag = null,
  previousTag = null,
  outputFile = null,
  repoSlug = null,
  exec = execSync,
} = {}) {
  if (!currentTag) {
    throw new Error("currentTag is required (e.g. mobile-v1.1.0)");
  }

  const detectedSlug = repoSlug || detectRepoSlug(exec);
  const detectedPrevTag = previousTag || findPreviousTag(workspace, currentTag, exec);

  const gitRange = detectedPrevTag ? `${detectedPrevTag}..${currentTag}` : currentTag;
  const workspacePath = workspace === "root" ? "." : `${workspace}/`;

  // Fetch commits for range and workspace
  let rawLog = "";
  try {
    rawLog = exec(
      `git log ${gitRange} --pretty=format:"%H%x1f%h%x1f%an%x1f%s%x1f%b%x1e" -- "${workspacePath}" ".github"`,
      { encoding: "utf8" },
    );
  } catch (err) {
    throw new Error(`Failed to query git log for range "${gitRange}": ${err.message}`);
  }

  const commits = parseGitCommits(rawLog);
  const prNumbers = extractPrNumbers(rawLog);

  // Fetch PR summaries if available
  const prSummaries = [];
  for (const prNum of prNumbers) {
    const summary = fetchPrSummary(prNum, exec);
    if (summary) {
      prSummaries.push(summary);
    }
  }

  const markdown = formatReleaseNotes({
    workspace,
    currentTag,
    previousTag: detectedPrevTag,
    commits,
    prSummaries,
    repoSlug: detectedSlug,
  });

  if (outputFile) {
    const resolvedPath = path.resolve(process.cwd(), outputFile);
    fs.writeFileSync(resolvedPath, markdown, "utf8");
  }

  return {
    currentTag,
    previousTag: detectedPrevTag,
    commitCount: commits.length,
    prCount: prSummaries.length,
    markdown,
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let workspace = "mobile";
  let tag = null;
  let prevTag = null;
  let outputFile = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--workspace" || args[i] === "-w") workspace = args[++i];
    else if (args[i] === "--tag" || args[i] === "-t") tag = args[++i];
    else if (args[i] === "--prev-tag" || args[i] === "-p") prevTag = args[++i];
    else if (args[i] === "--output" || args[i] === "-o") outputFile = args[++i];
  }

  if (!tag) {
    try {
      const pkgPath = path.resolve(process.cwd(), workspace, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        tag = `${workspace}-v${pkg.version}`;
      }
    } catch {
      // ignore
    }
  }

  if (!tag) {
    process.stderr.write("❌ Please specify --tag <tagName> (e.g. mobile-v1.1.0)\n");
    process.exit(1);
  }

  try {
    const result = generateReleaseNotes({
      workspace,
      currentTag: tag,
      previousTag: prevTag,
      outputFile,
    });

    if (!outputFile) {
      process.stdout.write(result.markdown + "\n");
    } else {
      process.stdout.write(`✅ Generated release notes for ${tag} at ${outputFile}\n`);
    }
  } catch (error) {
    process.stderr.write(`❌ Error generating release notes: ${error.message}\n`);
    process.exit(1);
  }
}

module.exports = {
  CATEGORIES,
  parseGitCommits,
  extractPrNumbers,
  fetchPrSummary,
  detectRepoSlug,
  findPreviousTag,
  formatReleaseNotes,
  generateReleaseNotes,
};
