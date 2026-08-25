// Unit tests for the build identifier. Named as the behaviour claimed rather than the function
// called, per design-guide.md — a failing test should describe what broke before anyone opens it.

import { describe, it, expect } from "vitest";
import { buildInfo, formatBuildInfo } from "../src/build-info";

describe("build identity", () => {
  it("pairs the commit with the build time, so a live page can be matched against main", () => {
    expect(formatBuildInfo({ sha: "f74e6e8", time: "2026-08-25 11:06 UTC" })).toBe(
      "f74e6e8 · 2026-08-25 11:06 UTC",
    );
  });

  it("degrades to unknown rather than throwing when the identifier was never injected", () => {
    // vitest.config.ts deliberately omits the `define` block, so this is the real un-injected
    // path rather than a mock of it.
    const info = buildInfo();
    expect(info.sha).toBe("unknown");
    expect(info.time).toBe("unknown");
  });

  it("formats an un-injected build without throwing, because the page still has to render", () => {
    expect(formatBuildInfo(buildInfo())).toBe("unknown · unknown");
  });
});
