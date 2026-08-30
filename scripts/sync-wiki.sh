#!/usr/bin/env bash
set -e

# ==============================================================================
# Script: sync-wiki.sh
# Purpose: Synchronize local wiki/ directory to GitHub Wiki git repository
# ==============================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WIKI_SRC="$ROOT_DIR/wiki"
TEMP_DIR="$ROOT_DIR/.wiki-temp"

if [ ! -d "$WIKI_SRC" ]; then
  echo "❌ Error: Source directory $WIKI_SRC does not exist."
  exit 1
fi

# Detect remote URL from git config
ORIGIN_URL=$(git -C "$ROOT_DIR" remote get-url origin 2>/dev/null || echo "")

if [ -z "$ORIGIN_URL" ]; then
  echo "❌ Error: Could not determine git origin URL."
  exit 1
fi

# Convert origin URL to wiki URL
# SSH: git@github.com:owner/repo.git -> git@github.com:owner/repo.wiki.git
# HTTPS: https://github.com/owner/repo.git -> https://github.com/owner/repo.wiki.git
if [[ "$ORIGIN_URL" == *".wiki.git"* ]]; then
  WIKI_URL="$ORIGIN_URL"
elif [[ "$ORIGIN_URL" == *.git ]]; then
  WIKI_URL="${ORIGIN_URL%.git}.wiki.git"
else
  WIKI_URL="${ORIGIN_URL}.wiki.git"
fi

echo "🚀 Cajero AI POS - Wiki Synchronizer"
echo "📂 Source Directory: $WIKI_SRC"
echo "🌐 Target Wiki URL : $WIKI_URL"
echo ""

# Clean temp directory if it exists
rm -rf "$TEMP_DIR"

echo "📥 Cloning GitHub Wiki repository..."
if ! git clone "$WIKI_URL" "$TEMP_DIR" 2>/dev/null; then
  echo "⚠️  Failed to clone $WIKI_URL"
  echo "💡 Tip: Make sure the Wiki feature is enabled in your GitHub repo settings and that you have created the initial page in GitHub UI."
  rm -rf "$TEMP_DIR"
  exit 1
fi

echo "🔄 Syncing files..."
find "$TEMP_DIR" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -R "$WIKI_SRC"/* "$TEMP_DIR/"

cd "$TEMP_DIR"
git add -A

if git diff --staged --quiet; then
  echo "✅ No changes to sync. GitHub Wiki is up-to-date."
else
  COMMIT_MSG="docs(wiki): update wiki documentation ($(date +'%Y-%m-%d %H:%M:%S'))"
  git commit -m "$COMMIT_MSG"
  echo "📤 Pushing changes to GitHub Wiki..."
  git push origin HEAD
  echo "🎉 Wiki synchronization complete!"
fi

# Cleanup
rm -rf "$TEMP_DIR"
