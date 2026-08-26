// The run — [DS-1.1], [DS-1.4], [DS-1.6], [DS-1.14].
//
// A run is three lives and one attempt at the map. In Arcade a game holds exactly one run, so a run
// ending *is* the game ending ([DS-1.4]) — which is why there is no separate Game type here yet.
// Journey is where the two come apart, and it is a later goal; introducing the split now would be a
// seam with nothing on the other side of it.
//
// Pure: every transition is a function from a run to the next run, and the map is passed in rather
// than held, so a run is plain serialisable data. Nothing here reaches the DOM, the clock, or
// storage — design-guide.md's domain seam is what lets these rules be tested in milliseconds.
//
// Transitions are named for the domain's own events. `Level cleared` is `levelCleared`; there is no
// translation layer, per design-guide.md.

import type { LevelId, LevelMap, Direction } from "./map";
import { isOpenForPlay, stepTo, unlockedLevels } from "./map";

/** [DS-1.1] — a run grants three lives, and they are never persisted beyond it. */
export const STARTING_LIVES = 3;

/** Why the game ended. [IS-4.3] needs these told apart: quitting and losing need different words. */
export type EndedBecause = "lives spent" | "abandoned";

/** Why a level cannot be entered. [IS-3.5] — the two look identical and lead to opposite actions. */
export type Closed = "cleared" | "locked";

export type RunPhase =
  | { readonly kind: "playing"; readonly level: LevelId }
  | { readonly kind: "navigating"; readonly at: LevelId }
  | { readonly kind: "ended"; readonly because: EndedBecause };

export type Run = {
  readonly livesRemaining: number;
  readonly cleared: ReadonlySet<LevelId>;
  readonly phase: RunPhase;
};

/**
 * [DS-1.6], [DS-1.1] — a run begins directly on a level that is open for play, and that level
 * starts immediately. Navigation happens *between* levels, never before the first one, so the
 * opening phase is `playing` rather than `navigating`.
 *
 * Arcade always starts at the map's start level. Journey may begin anywhere already unlocked, which
 * is why [DS-1.6] is worded as *a level that is open for play* rather than *the start level* — but
 * choosing where to begin is a later goal and is deliberately not a parameter here yet.
 */
export function startRun(map: LevelMap): Run {
  const cleared = new Set<LevelId>();
  if (!isOpenForPlay(map, cleared, map.start)) {
    // Guaranteed by [DS-1.9] seeding the start level. If it ever fails, the map is malformed and
    // failing loudly beats starting a run with nowhere to go.
    throw new Error(`the start level ${map.start} is not open for play`);
  }
  return { livesRemaining: STARTING_LIVES, cleared, phase: { kind: "playing", level: map.start } };
}

/**
 * [DS-1.14] — one of a level's two outcomes. The level is cleared, and the player is returned to
 * the map standing on it.
 *
 * The cleared level is added before the player is placed, so the levels it unlocks are open the
 * moment they arrive on the map rather than one step later.
 */
export function levelCleared(run: Run): Run {
  if (run.phase.kind !== "playing") {
    throw new Error("a level can only be cleared while one is being played");
  }
  const level = run.phase.level;
  const cleared = new Set(run.cleared);
  cleared.add(level);
  return { ...run, cleared, phase: { kind: "navigating", at: level } };
}

/**
 * [DS-1.14], [DS-1.1], [IS-2.3] — the other outcome. A life is spent; the level is **not** exited
 * while lives remain, because losing a life is not one of a level's two ways out.
 *
 * Spending the last life ends the run, and in Arcade that ends the game ([DS-1.4]). This is the
 * policy from domain-spec: no actor asks for it, arithmetic triggers it.
 */
export function lifeLost(run: Run): Run {
  if (run.phase.kind !== "playing") {
    throw new Error("a life can only be lost while a level is being played");
  }
  const livesRemaining = run.livesRemaining - 1;
  if (livesRemaining <= 0) {
    return { ...run, livesRemaining: 0, phase: { kind: "ended", because: "lives spent" } };
  }
  // Phase deliberately unchanged — [DS-1.15]: play continues from where it was.
  return { ...run, livesRemaining };
}

/**
 * [DS-1.7] — a step along one connection, in any direction, onto whatever is there. Moving is not
 * playing: a step onto a cleared or locked level succeeds, it simply does not start anything.
 *
 * A step with nothing that way is refused rather than throwing, because the player can ask for one
 * — pressing an arrow key at the edge of the map is an ordinary thing to do, not a bug.
 */
export function chooseLevel(map: LevelMap, run: Run, direction: Direction): Run {
  if (run.phase.kind !== "navigating") return run;
  const to = stepTo(map, run.phase.at, direction);
  if (!to) return run;
  return { ...run, phase: { kind: "navigating", at: to } };
}

/**
 * [DS-1.8] — entering the level the player is standing on, when it is open for play. Refused
 * without complaint otherwise; `whyClosed` says which of the two reasons applies.
 */
export function startLevel(map: LevelMap, run: Run): Run {
  if (run.phase.kind !== "navigating") return run;
  const level = run.phase.at;
  if (!isOpenForPlay(map, run.cleared, level)) return run;
  return { ...run, phase: { kind: "playing", level } };
}

/**
 * Which of the two reasons a level cannot be entered, or undefined when it can — [IS-3.5].
 *
 * The two are mutually exclusive, and that is a consequence of [DS-1.9] rather than of the order of
 * these checks: a cleared level is always unlocked, because clearing it is what put it in the
 * unlocked set. So nothing is ever both, and no precedence is being chosen here.
 *
 * Worth stating because the opposite is the natural assumption — "cleared" and "locked" sound like
 * overlapping states, and a later reader could reasonably add a precedence rule that does nothing.
 */
export function whyClosed(map: LevelMap, run: Run, level: LevelId): Closed | undefined {
  if (run.cleared.has(level)) return "cleared";
  if (!unlockedLevels(map, run.cleared).has(level)) return "locked";
  return undefined;
}

/** The levels open for play right now. Empty with lives left is the dead end [IS-3.7] describes. */
export function openLevels(map: LevelMap, run: Run): readonly LevelId[] {
  return map.levels
    .map((placement) => placement.id)
    .filter((id) => isOpenForPlay(map, run.cleared, id));
}

/**
 * [DS-1.13] — a game may be aborted at any time, from any state, including mid-level.
 *
 * Unlike every other transition here there is no phase it is invalid from, which is the whole point
 * of the rule: abort is the one action always available, and in this release it is also the only way
 * off a map with nothing left open ([IS-3.7]).
 *
 * Aborting an already-ended game changes nothing rather than overwriting why it ended. A run that
 * ran out of lives and was then abandoned ended because of the lives, and [IS-4.3] has to keep
 * telling the player which of the two happened.
 */
export function abortGame(run: Run): Run {
  if (run.phase.kind === "ended") return run;
  return { ...run, phase: { kind: "ended", because: "abandoned" } };
}

export function isOver(run: Run): boolean {
  return run.phase.kind === "ended";
}

/** How many levels were cleared, for the ending to report — [IS-4.1]. */
export function levelsCleared(run: Run): number {
  return run.cleared.size;
}
