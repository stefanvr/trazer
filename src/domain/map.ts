// The map, and what it opens — [DS-1.7], [DS-1.8], [DS-1.9].
//
// Pure: the map is authored data, and every question about it is a function over that data plus a
// set of cleared levels. Nothing here records anything. The unlocked set in particular is derived
// on every ask rather than stored, because domain-spec.md states it as a derivation — an unlock
// event would carry nothing that `Level cleared` and the map do not already carry between them.
//
// The mode never appears in this file. Arcade and Journey differ only in *which* cleared set is
// passed in — the run's or the game's — so one implementation serves both ([DS-1.9], [DS-1.3]).
// Adding a mode parameter here would be the wrong seam and would have to be removed again when
// Journey lands.

export type LevelId = string;

export type Direction = "up" | "down" | "left" | "right";

/** A level and where it sits, so that a move can be named by the direction it travels. */
export type LevelPlacement = {
  readonly id: LevelId;
  readonly x: number;
  readonly y: number;
};

export type LevelMap = {
  readonly start: LevelId;
  readonly levels: readonly LevelPlacement[];
  /** Undirected: a connection is walkable both ways, per [DS-1.7]. */
  readonly connections: readonly (readonly [LevelId, LevelId])[];
};

export function levelIds(map: LevelMap): readonly LevelId[] {
  return map.levels.map((level) => level.id);
}

export function placementOf(map: LevelMap, id: LevelId): LevelPlacement | undefined {
  return map.levels.find((level) => level.id === id);
}

/**
 * Levels directly connected to `of`, in the order their connections were authored.
 *
 * The order is fixed rather than incidental: design-guide.md requires ties broken deterministically,
 * and this list drives the order moves are drawn and tabbed through.
 */
export function neighbours(map: LevelMap, of: LevelId): readonly LevelId[] {
  const found: LevelId[] = [];
  for (const [a, b] of map.connections) {
    if (a === of && !found.includes(b)) found.push(b);
    else if (b === of && !found.includes(a)) found.push(a);
  }
  return found;
}

export function areConnected(map: LevelMap, a: LevelId, b: LevelId): boolean {
  return neighbours(map, a).includes(b);
}

/**
 * The unlocked set — [DS-1.9]. Every cleared level, plus every level directly connected to one,
 * plus the start level.
 *
 * The start level is seeded unconditionally because an empty cleared set must still open something:
 * without it a new run would begin with nowhere to go, contradicting [DS-1.6]. It is harmless once
 * the start level has been cleared, since a cleared level is unlocked anyway — being unlocked is
 * not the same as being open for play (see `isOpenForPlay`).
 */
export function unlockedLevels(map: LevelMap, cleared: ReadonlySet<LevelId>): ReadonlySet<LevelId> {
  const unlocked = new Set<LevelId>([map.start]);
  for (const level of cleared) {
    unlocked.add(level);
    for (const neighbour of neighbours(map, level)) unlocked.add(neighbour);
  }
  return unlocked;
}

/**
 * Open for play — [DS-1.8]: unlocked, and not cleared in the current run.
 *
 * The `cleared` argument is doing two jobs at once and that is deliberate: it is what unlocks
 * levels and what closes them. A level cleared this run is therefore simultaneously the reason its
 * neighbours opened and the reason it itself is shut.
 */
export function isOpenForPlay(
  map: LevelMap,
  cleared: ReadonlySet<LevelId>,
  level: LevelId,
): boolean {
  if (cleared.has(level)) return false;
  return unlockedLevels(map, cleared).has(level);
}

/**
 * The direction travelled going `from` → `to`, or undefined when they are not connected or do not
 * line up on an axis.
 *
 * Diagonal connections have no direction and are rejected rather than rounded to the nearest axis:
 * [IS-3.6] binds an arrow key to each move, and a move two keys could plausibly mean is worse than
 * a map that does not have one.
 */
export function directionBetween(
  map: LevelMap,
  from: LevelId,
  to: LevelId,
): Direction | undefined {
  if (!areConnected(map, from, to)) return undefined;
  const a = placementOf(map, from);
  const b = placementOf(map, to);
  if (!a || !b) return undefined;
  if (a.x === b.x && b.y > a.y) return "up";
  if (a.x === b.x && b.y < a.y) return "down";
  if (a.y === b.y && b.x < a.x) return "left";
  if (a.y === b.y && b.x > a.x) return "right";
  return undefined;
}

/** The moves out of a level, each with the direction it travels. Undirected moves are omitted. */
export function movesFrom(
  map: LevelMap,
  from: LevelId,
): readonly { readonly to: LevelId; readonly direction: Direction }[] {
  const moves: { to: LevelId; direction: Direction }[] = [];
  for (const to of neighbours(map, from)) {
    const direction = directionBetween(map, from, to);
    if (direction) moves.push({ to, direction });
  }
  return moves;
}

/** Where a step in `direction` lands, or undefined when nothing lies that way — [DS-1.7]. */
export function stepTo(map: LevelMap, from: LevelId, direction: Direction): LevelId | undefined {
  return movesFrom(map, from).find((move) => move.direction === direction)?.to;
}
