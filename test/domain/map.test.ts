// Tests for the map and what it opens. Named as the behaviour claimed and led by the identifier,
// per design-guide.md, so `npm run spec:coverage` can see which rules are exercised.

import { describe, it, expect } from "vitest";
import {
  areConnected,
  directionBetween,
  isOpenForPlay,
  levelIds,
  movesFrom,
  neighbours,
  stepTo,
  unlockedLevels,
} from "../../src/domain/map";
import { TRAZER_MAP } from "../../src/domain/trazer-map";

const cleared = (...ids: string[]) => new Set(ids);

describe("the map as authored", () => {
  it("has seven levels arranged as a plus with two hanging off the right leaf", () => {
    expect(levelIds(TRAZER_MAP)).toEqual(["C", "N", "S", "W", "E", "Eu", "Ed"]);
    expect(neighbours(TRAZER_MAP, "C")).toEqual(["W", "N", "S", "E"]);
    expect(neighbours(TRAZER_MAP, "E")).toEqual(["C", "Eu", "Ed"]);
    expect(neighbours(TRAZER_MAP, "W")).toEqual(["C"]);
  });

  it("connects both ways, so a connection can be walked back along", () => {
    expect(areConnected(TRAZER_MAP, "C", "E")).toBe(true);
    expect(areConnected(TRAZER_MAP, "E", "C")).toBe(true);
    expect(areConnected(TRAZER_MAP, "N", "Eu")).toBe(false);
  });
});

describe("[DS-1.9] — the unlocked set is derived, never recorded", () => {
  it("opens the start level before anything has been cleared, so a new run has somewhere to go", () => {
    // Without seeding the start level the derivation yields nothing from an empty cleared set, and
    // DS-1.6 could not hold.
    expect([...unlockedLevels(TRAZER_MAP, cleared())]).toEqual(["C"]);
  });

  it("opens every neighbour of a cleared level", () => {
    const unlocked = unlockedLevels(TRAZER_MAP, cleared("C"));
    expect([...unlocked].sort()).toEqual(["C", "E", "N", "S", "W"]);
  });

  it("does not open a level two connections away from anything cleared", () => {
    expect(unlockedLevels(TRAZER_MAP, cleared("C")).has("Eu")).toBe(false);
    expect(unlockedLevels(TRAZER_MAP, cleared("C", "E")).has("Eu")).toBe(true);
  });

  it("gives the same answer however many times it is asked", () => {
    const first = [...unlockedLevels(TRAZER_MAP, cleared("C", "E"))].sort();
    const second = [...unlockedLevels(TRAZER_MAP, cleared("C", "E"))].sort();
    expect(first).toEqual(second);
  });
});

describe("[DS-1.8] — open for play is unlocked, and not cleared in this run", () => {
  it("opens the start level at the beginning of a run", () => {
    expect(isOpenForPlay(TRAZER_MAP, cleared(), "C")).toBe(true);
  });

  it("closes a level once it has been cleared in this run", () => {
    expect(isOpenForPlay(TRAZER_MAP, cleared("C"), "C")).toBe(false);
  });

  it("leaves a locked level shut even though it is uncleared", () => {
    // Two different reasons to be unplayable, which IS-3.5 requires the map to tell apart.
    expect(isOpenForPlay(TRAZER_MAP, cleared(), "Eu")).toBe(false);
    expect(unlockedLevels(TRAZER_MAP, cleared()).has("Eu")).toBe(false);
  });

  it("treats a cleared level as unlocked but shut, which are not the same thing", () => {
    expect(unlockedLevels(TRAZER_MAP, cleared("C")).has("C")).toBe(true);
    expect(isOpenForPlay(TRAZER_MAP, cleared("C"), "C")).toBe(false);
  });
});

describe("[DS-1.7] — stepping moves one connection, in any direction", () => {
  it("steps to a connected level whatever state it is in", () => {
    expect(stepTo(TRAZER_MAP, "C", "right")).toBe("E");
    expect(stepTo(TRAZER_MAP, "C", "up")).toBe("N");
    expect(stepTo(TRAZER_MAP, "C", "left")).toBe("W");
    expect(stepTo(TRAZER_MAP, "C", "down")).toBe("S");
  });

  it("steps back the way it came, because ground already covered stays walkable", () => {
    expect(stepTo(TRAZER_MAP, "E", "left")).toBe("C");
    expect(stepTo(TRAZER_MAP, "Eu", "down")).toBe("E");
  });

  it("goes nowhere when nothing lies that way", () => {
    expect(stepTo(TRAZER_MAP, "W", "left")).toBeUndefined();
    expect(stepTo(TRAZER_MAP, "N", "up")).toBeUndefined();
  });

  it("names each move by the direction it travels, for the arrow-head that draws it", () => {
    expect(movesFrom(TRAZER_MAP, "E")).toEqual([
      { to: "C", direction: "left" },
      { to: "Eu", direction: "up" },
      { to: "Ed", direction: "down" },
    ]);
  });

  it("refuses a direction between levels that are not connected", () => {
    // N and Eu sit on the same row but share no connection; adjacency on the grid is not a move.
    expect(directionBetween(TRAZER_MAP, "N", "Eu")).toBeUndefined();
  });
});
