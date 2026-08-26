// The map screen — [IS-3.1], [IS-3.2], [IS-3.3], [IS-3.5], [IS-3.7], [IS-3.8].
//
// A pure function from state to markup. It computes and returns a string; it does not touch the
// document, attach a listener, or hold anything. design-guide.md puts pure computation outside the
// renderer, and the payoff here is direct: the layout maths and every state-to-appearance decision
// are unit-testable without a browser, leaving Playwright to check only that the wiring is real.
//
// Geometry is derived from the map's own placements rather than hardcoded to the seven-level plus,
// so changing the level layout does not touch this file.

import type { LevelId, LevelMap } from "../domain/map";
import { isOpenForPlay, movesFrom } from "../domain/map";
import type { Run } from "../domain/run";

const CELL = 92;
const PAD = 46;
const NODE = 20;
const CURRENT = 30;

type Point = { readonly x: number; readonly y: number };

/** Grid coordinates to screen coordinates. Screen y grows downward, so the axis is flipped. */
function layout(map: LevelMap): {
  readonly at: (id: LevelId) => Point;
  readonly width: number;
  readonly height: number;
} {
  const xs = map.levels.map((l) => l.x);
  const ys = map.levels.map((l) => l.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const at = (id: LevelId): Point => {
    const level = map.levels.find((l) => l.id === id);
    if (!level) return { x: 0, y: 0 };
    return { x: (level.x - minX) * CELL + PAD, y: (maxY - level.y) * CELL + PAD };
  };
  return {
    at,
    width: (maxX - minX) * CELL + PAD * 2,
    height: (maxY - minY) * CELL + PAD * 2,
  };
}

/**
 * [IS-3.3] — the three states a level is shown in.
 *
 * Cleared is asked first, so past that point "unlocked" and "open for play" are the same question:
 * a level that is unlocked and not cleared is by definition open ([DS-1.8]). Asking both would read
 * as covering two cases and cover one.
 */
export function stateOf(map: LevelMap, run: Run, id: LevelId): "cleared" | "open" | "locked" {
  if (run.cleared.has(id)) return "cleared";
  return isOpenForPlay(map, run.cleared, id) ? "open" : "locked";
}

/** An arrow-head pointing the way the move travels — [IS-3.2]. */
function arrowHead(from: Point, to: Point): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  // Sit the head between the two nodes, clear of both, and point it along the move.
  const cx = from.x + ux * (length / 2);
  const cy = from.y + uy * (length / 2);
  const size = 13;
  const tip = `${cx + ux * size},${cy + uy * size}`;
  const left = `${cx - ux * size + uy * size},${cy - uy * size - ux * size}`;
  const right = `${cx - ux * size - uy * size},${cy - uy * size + ux * size}`;
  return `${tip} ${left} ${right}`;
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function mapView(map: LevelMap, run: Run, notice: string | undefined): string {
  if (run.phase.kind !== "navigating") return "";
  const here = run.phase.at;
  const { at, width, height } = layout(map);
  const moves = movesFrom(map, here);

  const edges = map.connections
    .map(([a, b]) => {
      const p = at(a);
      const q = at(b);
      return `<line class="edge" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" />`;
    })
    .join("");

  const nodes = map.levels
    .map((level) => {
      const p = at(level.id);
      const state = stateOf(map, run, level.id);
      const isHere = level.id === here;
      // [IS-3.1] — the level being stood on is a circle, and larger, so it is found at a glance.
      const radius = isHere ? CURRENT : NODE;
      const enter = isHere ? ` data-action="enter" tabindex="0" role="button"` : "";
      return (
        `<g data-testid="node-${escapeText(level.id)}" data-state="${state}"` +
        `${isHere ? ' data-here="true"' : ""}${enter}>` +
        `<circle class="node ${state}${isHere ? " here" : ""}" cx="${p.x}" cy="${p.y}" r="${radius}" />` +
        `<text class="label" x="${p.x}" y="${p.y + 5}">${escapeText(level.id)}</text>` +
        `</g>`
      );
    })
    .join("");

  // [IS-3.2] — the triangles are the moves; there is no separate list of destinations.
  const arrows = moves
    .map((move) => {
      const points = arrowHead(at(here), at(move.to));
      return (
        `<polygon class="move" points="${points}" data-testid="move-${move.direction}" ` +
        `data-action="step" data-direction="${move.direction}" tabindex="0" role="button" />`
      );
    })
    .join("");

  const message = notice
    ? `<p class="notice" data-testid="map-message">${escapeText(notice)}</p>`
    : "";

  return (
    `<section class="map" data-testid="map">` +
    `<h1>Trazer</h1>` +
    // [IS-3.8] — the svg scales to its box rather than forcing the page wider than the viewport.
    `<svg viewBox="0 0 ${width} ${height}" class="board" role="img" aria-label="level map">` +
    `${edges}${arrows}${nodes}</svg>` +
    message +
    `</section>`
  );
}
