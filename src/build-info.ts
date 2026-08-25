// Build identity — RECIPE.md's deploy-confirmation rule.
//
// The values are injected at build time by vite.config.ts. They exist so a live page can be
// *checked* against `main` rather than assumed current, which is the only way a deploy is ever
// confirmed rather than believed.
//
// Reading them degrades to `unknown` rather than throwing, and that is not defensive habit: an
// identifier that breaks the page it exists to describe is worse than no identifier at all. Under
// the unit tests the injection deliberately does not happen, so this path is the one being tested.

declare const __BUILD_SHA__: string;
declare const __BUILD_TIME__: string;

export type BuildInfo = {
  sha: string;
  time: string;
};

export function buildInfo(): BuildInfo {
  return {
    sha: read(() => __BUILD_SHA__),
    time: read(() => __BUILD_TIME__),
  };
}

export function formatBuildInfo(info: BuildInfo): string {
  return `${info.sha} · ${info.time}`;
}

function read(get: () => string): string {
  try {
    const value = get();
    return typeof value === "string" && value.length > 0 ? value : "unknown";
  } catch {
    // Not merely undefined — an un-replaced identifier is a ReferenceError, which a truthiness
    // check would never reach.
    return "unknown";
  }
}
