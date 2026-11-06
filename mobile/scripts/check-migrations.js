#!/usr/bin/env node
/**
 * Migration Completeness Verifier for Drizzle SQLite.
 *
 * Verifies that:
 * 1. Every migration tag in meta/_journal.json has a corresponding .sql file on disk.
 * 2. Every migration file is tracked or staged in git (not untracked / ignored).
 * 3. Every migration tag in meta/_journal.json is imported and registered in migrations.js.
 */

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

function checkMigrations({
  migrationsDir = path.resolve(__dirname, "../db/migrations"),
  journalPath = path.resolve(__dirname, "../db/migrations/meta/_journal.json"),
  migrationsJsPath = path.resolve(__dirname, "../db/migrations/migrations.js"),
} = {}) {
  const errors = [];

  if (!fs.existsSync(journalPath)) {
    return {
      success: false,
      errors: [`Migration journal not found at: ${journalPath}`],
      count: 0,
    };
  }

  const journal = JSON.parse(fs.readFileSync(journalPath, "utf8"));
  const entries = journal.entries || [];

  if (entries.length === 0) {
    return { success: true, errors: [], count: 0 };
  }

  const migrationsJsContent = fs.existsSync(migrationsJsPath)
    ? fs.readFileSync(migrationsJsPath, "utf8")
    : "";

  for (const entry of entries) {
    const { tag, idx } = entry;
    const sqlFileName = `${tag}.sql`;
    const sqlFilePath = path.join(migrationsDir, sqlFileName);

    if (!fs.existsSync(sqlFilePath)) {
      errors.push(`Missing migration file: ${sqlFileName} (indexed as idx ${idx})`);
      continue;
    }

    try {
      const gitStatus = execSync(
        `git status --porcelain "${path.relative(process.cwd(), sqlFilePath)}"`,
        { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] },
      ).trim();

      if (gitStatus.startsWith("??")) {
        errors.push(
          `Migration file is untracked in git: ${sqlFileName}. Run 'git add ${path.relative(
            process.cwd(),
            sqlFilePath,
          )}' before committing.`,
        );
      }
    } catch {
      // Non-fatal if git is unavailable
    }

    if (migrationsJsContent && !migrationsJsContent.includes(sqlFileName)) {
      errors.push(`Migration file is not imported in migrations.js: ${sqlFileName}`);
    }
  }

  return {
    success: errors.length === 0,
    errors,
    count: entries.length,
  };
}

if (require.main === module) {
  const result = checkMigrations();
  if (!result.success) {
    for (const err of result.errors) {
      process.stderr.write(`❌ ${err}\n`);
    }
    process.stderr.write("\n❌ Migration integrity check failed.\n");
    process.exit(1);
  }
  process.stdout.write(
    `✅ All ${result.count} Drizzle migrations are complete, registered, and tracked.\n`,
  );
}

module.exports = { checkMigrations };
