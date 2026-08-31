const path = require("node:path");

/**
 * lint-staged config for the cajero-ai-pos monorepo.
 *
 * Biome is installed inside `mobile/node_modules`, so we cd into `mobile/`
 * and resolve paths relative to that directory before passing them to Biome.
 */
module.exports = {
  "mobile/**/*.{ts,tsx,js,jsx}": (absolutePaths) => {
    const mobileRoot = path.resolve(__dirname, "mobile");
    const relativePaths = absolutePaths
      .map((p) => `"${path.relative(mobileRoot, p)}"`)
      .join(" ");
    return `bash -c 'cd mobile && yarn biome check --write --no-errors-on-unmatched --files-ignore-unknown=true ${relativePaths}'`;
  },
};
