// Tests for the ending screen.

import { describe, it, expect } from "vitest";
import { endingView } from "../../src/ui/ending-view";
import { TRAZER_MAP } from "../../src/domain/trazer-map";
import { abortGame, levelCleared, lifeLost, startRun } from "../../src/domain/run";

const spent = () => lifeLost(lifeLost(lifeLost(startRun(TRAZER_MAP))));
const abandoned = () => abortGame(startRun(TRAZER_MAP));

describe("IS-4.3 — the ending names which ending it was", () => {
  it("tells a run that ran out of lives from one that was abandoned", () => {
    expect(endingView(spent())).toContain('data-because="lives spent"');
    expect(endingView(abandoned())).toContain('data-because="abandoned"');
  });

  it("says something different to each, because they need different words", () => {
    expect(endingView(spent())).toContain("Out of lives");
    expect(endingView(abandoned())).toContain("Game abandoned");
  });
});

describe("IS-4.1 — the ending reports the run", () => {
  it("reports nothing cleared when nothing was", () => {
    expect(endingView(spent())).toContain("<strong>0</strong>");
  });

  it("counts what was cleared before the run ended", () => {
    const run = abortGame(levelCleared(startRun(TRAZER_MAP)));
    expect(endingView(run)).toContain("<strong>1</strong>");
  });
});

describe("IS-4.2 — the way out is a new game", () => {
  it("offers a new game rather than a new run, because in Arcade the run was the game", () => {
    expect(endingView(spent())).toContain('data-testid="new-game"');
    expect(endingView(spent())).toContain("New game");
  });
});

describe("the ending is only the ending", () => {
  it("renders nothing while the run is still alive", () => {
    expect(endingView(startRun(TRAZER_MAP))).toBe("");
    expect(endingView(levelCleared(startRun(TRAZER_MAP)))).toBe("");
  });
});
