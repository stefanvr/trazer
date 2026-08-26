// Tests for the run. Named as the behaviour claimed and led by the identifier, per design-guide.md.

import { describe, it, expect } from "vitest";
import {
  STARTING_LIVES,
  abortGame,
  chooseLevel,
  isOver,
  levelCleared,
  levelsCleared,
  lifeLost,
  openLevels,
  startLevel,
  startRun,
  whyClosed,
  type Run,
} from "../../src/domain/run";
import { TRAZER_MAP } from "../../src/domain/trazer-map";
import type { Direction } from "../../src/domain/map";

/** Step that way, enter what is there, and clear it — the whole loop in one move. */
const goAndClear = (run: Run, direction: Direction): Run =>
  levelCleared(startLevel(TRAZER_MAP, chooseLevel(TRAZER_MAP, run, direction)));

const step = (run: Run, direction: Direction): Run => chooseLevel(TRAZER_MAP, run, direction);

describe("DS-1.6 — a run begins already playing an open level", () => {
  it("opens on the start level rather than on the map", () => {
    const run = startRun(TRAZER_MAP);
    expect(run.phase).toEqual({ kind: "playing", level: "C" });
  });

  it("grants three lives and nothing cleared", () => {
    const run = startRun(TRAZER_MAP);
    expect(run.livesRemaining).toBe(STARTING_LIVES);
    expect(levelsCleared(run)).toBe(0);
  });
});

describe("DS-1.14 — a level ends exactly two ways", () => {
  it("returns the player to the map standing on the level they cleared", () => {
    const run = levelCleared(startRun(TRAZER_MAP));
    expect(run.phase).toEqual({ kind: "navigating", at: "C" });
    expect(run.cleared.has("C")).toBe(true);
  });

  it("opens what the cleared level unlocks immediately, not one step later", () => {
    const run = levelCleared(startRun(TRAZER_MAP));
    expect([...openLevels(TRAZER_MAP, run)].sort()).toEqual(["E", "N", "S", "W"]);
  });

  it("does not end the level when a life is lost and lives remain", () => {
    // The whole of H1: a life is a budget for the run, not a retry of the level.
    const run = lifeLost(startRun(TRAZER_MAP));
    expect(run.phase).toEqual({ kind: "playing", level: "C" });
    expect(run.livesRemaining).toBe(2);
  });
});

describe("DS-1.1 — three lives, and the run ends when the last is spent", () => {
  it("keeps playing through the first two losses", () => {
    let run = startRun(TRAZER_MAP);
    run = lifeLost(run);
    run = lifeLost(run);
    expect(isOver(run)).toBe(false);
    expect(run.livesRemaining).toBe(1);
  });

  it("ends the run on the third loss, naming lives as the cause", () => {
    let run = startRun(TRAZER_MAP);
    run = lifeLost(lifeLost(lifeLost(run)));
    expect(run.phase).toEqual({ kind: "ended", because: "lives spent" });
    expect(run.livesRemaining).toBe(0);
  });

  it("keeps what was cleared before the run ended, so the ending can report it", () => {
    let run = levelCleared(startRun(TRAZER_MAP));
    run = startLevel(TRAZER_MAP, chooseLevel(TRAZER_MAP, run, "right"));
    run = lifeLost(lifeLost(lifeLost(run)));
    expect(isOver(run)).toBe(true);
    expect(levelsCleared(run)).toBe(1);
  });
});

describe("DS-1.7 — stepping across the map without playing", () => {
  it("steps onto a connected level and starts nothing", () => {
    const run = step(levelCleared(startRun(TRAZER_MAP)), "right");
    expect(run.phase).toEqual({ kind: "navigating", at: "E" });
  });

  it("steps back over a level already cleared, because passage is not a replay", () => {
    let run = levelCleared(startRun(TRAZER_MAP));
    run = chooseLevel(TRAZER_MAP, run, "right");
    run = chooseLevel(TRAZER_MAP, run, "left");
    expect(run.phase).toEqual({ kind: "navigating", at: "C" });
    expect(run.livesRemaining).toBe(STARTING_LIVES);
  });

  it("refuses a step off the edge of the map without complaint", () => {
    let run = levelCleared(startRun(TRAZER_MAP));
    run = chooseLevel(TRAZER_MAP, run, "left");
    const stuck = chooseLevel(TRAZER_MAP, run, "left");
    expect(stuck.phase).toEqual({ kind: "navigating", at: "W" });
  });
});

describe("DS-1.8 — a level opens when unlocked and not cleared this run", () => {
  it("starts an unlocked, uncleared level", () => {
    let run = levelCleared(startRun(TRAZER_MAP));
    run = startLevel(TRAZER_MAP, chooseLevel(TRAZER_MAP, run, "up"));
    expect(run.phase).toEqual({ kind: "playing", level: "N" });
  });

  it("refuses to restart a level cleared in this run, and says why", () => {
    const run = levelCleared(startRun(TRAZER_MAP));
    expect(startLevel(TRAZER_MAP, run).phase).toEqual({ kind: "navigating", at: "C" });
    expect(whyClosed(TRAZER_MAP, run, "C")).toBe("cleared");
  });

  it("refuses a locked level, and distinguishes it from a cleared one", () => {
    let run = levelCleared(startRun(TRAZER_MAP));
    run = chooseLevel(TRAZER_MAP, run, "right");
    // E is open, but Eu beyond it is not yet unlocked.
    expect(whyClosed(TRAZER_MAP, run, "E")).toBeUndefined();
    expect(whyClosed(TRAZER_MAP, run, "Eu")).toBe("locked");
  });

  it("never calls a cleared level locked, because clearing it is what unlocked it", () => {
    // The two reasons are disjoint by DS-1.9, not by a precedence rule. Asserted so that a later
    // change to the unlocked derivation cannot quietly make a cleared level report as locked.
    let run = levelCleared(startRun(TRAZER_MAP));
    run = goAndClear(run, "right");
    for (const level of ["C", "E"]) {
      expect(whyClosed(TRAZER_MAP, run, level)).toBe("cleared");
    }
  });
});

describe("DS-1.13 — a game may be aborted from any state", () => {
  it("aborts from inside a level", () => {
    const run = abortGame(startRun(TRAZER_MAP));
    expect(run.phase).toEqual({ kind: "ended", because: "abandoned" });
  });

  it("aborts from the map", () => {
    const run = abortGame(levelCleared(startRun(TRAZER_MAP)));
    expect(run.phase).toEqual({ kind: "ended", because: "abandoned" });
  });

  it("keeps lives and clears intact, so the ending can still report them", () => {
    let run = levelCleared(startRun(TRAZER_MAP));
    run = abortGame(lifeLost(startLevel(TRAZER_MAP, chooseLevel(TRAZER_MAP, run, "up"))));
    expect(levelsCleared(run)).toBe(1);
    expect(run.livesRemaining).toBe(2);
  });

  it("does not overwrite why a run already ended", () => {
    // IS-4.3 has to tell a player who quit from one who lost; abandoning a finished run must not
    // rewrite the first as the second.
    const spent = lifeLost(lifeLost(lifeLost(startRun(TRAZER_MAP))));
    expect(abortGame(spent).phase).toEqual({ kind: "ended", because: "lives spent" });
  });
});

describe("IS-3.7 — clearing everything with lives left strands the player", () => {
  it("leaves no level open once all seven are cleared, with the run still alive", () => {
    let run = levelCleared(startRun(TRAZER_MAP)); // C, standing on it
    run = step(goAndClear(run, "up"), "down"); // N, back to C
    run = step(goAndClear(run, "down"), "up"); // S, back to C
    run = step(goAndClear(run, "left"), "right"); // W, back to C
    run = goAndClear(run, "right"); // E, standing on it
    run = step(goAndClear(run, "up"), "down"); // Eu, back to E
    run = goAndClear(run, "down"); // Ed

    expect(levelsCleared(run)).toBe(7);
    expect(openLevels(TRAZER_MAP, run)).toEqual([]);
    // Not an ending: the run has lives and the game has no end level yet. IS-3.7 is the map having
    // to say so, because silence here reads as a bug rather than an unfinished game.
    expect(isOver(run)).toBe(false);
    expect(run.livesRemaining).toBe(STARTING_LIVES);
  });
});
