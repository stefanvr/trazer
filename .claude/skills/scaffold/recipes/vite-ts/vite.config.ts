// Build configuration, and the injection of the build identifier that makes a deploy confirmable
// rather than assumed — see RECIPE.md and tech-spec.md.
//
// `base` comes from the environment because GitHub project pages are served from a subpath: the
// deploy workflow sets it to the repository name. A user site or custom domain leaves it unset.

import { defineConfig } from "vite";
import { execSync } from "node:child_process";

function commitSha(): string {
  // CI already knows the SHA; locally, ask git. Neither is guaranteed — a tarball has no git
  // directory — so failure degrades rather than breaking the build.
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

function buildTime(): string {
  // UTC, and to the minute. Local time in a build identifier is unreadable to anyone comparing it
  // against a commit timestamp from somewhere else.
  return new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";
}

export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  define: {
    __BUILD_SHA__: JSON.stringify(commitSha()),
    __BUILD_TIME__: JSON.stringify(buildTime()),
  },
});
