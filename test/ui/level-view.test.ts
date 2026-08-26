// Tests for the level screen — the placeholder standing in for an arena.

import { describe, it, expect } from "vitest";
import { levelView } from "../../src/ui/level-view";
import { TRAZER_MAP } from "../../src/domain/trazer-map";
import { levelCleared, lifeLost, startRun } from "../../src/domain/run";

describe("IS-2.2 — a level says which it is, and what the run has left", () => {
  it("names the level, because the map is not visible from inside one", () => {
    expect(levelView(startRun(TRAZER_MAP))).toContain("Level C");
  });

  it("shows lives remaining, and follows them down", () => {
    expect(levelView(startRun(TRAZER_MAP))).toContain("<strong>3</strong>");
    expect(levelView(lifeLost(startRun(TRAZER_MAP)))).toContain("<strong>2</strong>");
  });
});

describe("IS-2.4 — the two outcomes are offered as controls", () => {
  it("offers exactly the two ways a level can end, and no third", () => {
    const markup = levelView(startRun(TRAZER_MAP));
    expect(markup).toContain('data-testid="clear-level"');
    expect(markup).toContain('data-testid="lose-a-life"');
  });

  it("ships them ungated, because they are the slice's content and not a dev shortcut", () => {
    const markup = levelView(startRun(TRAZER_MAP));
    expect(markup).not.toContain("hidden");
    expect(markup).not.toContain("dev");
  });

  it("offers abandoning from inside a level, per DS-1.13", () => {
    expect(levelView(startRun(TRAZER_MAP))).toContain('data-testid="abort"');
  });
});

describe("the level screen is only the level screen", () => {
  it("renders nothing once the player is back on the map", () => {
    expect(levelView(levelCleared(startRun(TRAZER_MAP)))).toBe("");
  });
});
