// Tests for the map screen. The view is a pure function, so its layout and state decisions are
// checked here without a browser — Playwright is left to prove only that the wiring is real.

import { describe, it, expect } from "vitest";
import { mapView, stateOf } from "../../src/ui/map-view";
import { TRAZER_MAP } from "../../src/domain/trazer-map";
import { chooseLevel, levelCleared, startLevel, startRun, type Run } from "../../src/domain/run";
import type { Direction } from "../../src/domain/map";

const onTheMap = (): Run => levelCleared(startRun(TRAZER_MAP));
const step = (run: Run, d: Direction) => chooseLevel(TRAZER_MAP, run, d);
const goAndClear = (run: Run, d: Direction) => levelCleared(startLevel(TRAZER_MAP, step(run, d)));

describe("[IS-3.3] — every level shows which of three states it is in", () => {
  it("marks the cleared, the open and the locked apart", () => {
    const run = onTheMap();
    expect(stateOf(TRAZER_MAP, run, "C")).toBe("cleared");
    expect(stateOf(TRAZER_MAP, run, "E")).toBe("open");
    expect(stateOf(TRAZER_MAP, run, "Eu")).toBe("locked");
  });

  it("puts the state on every node in the markup, not only the interesting ones", () => {
    const markup = mapView(TRAZER_MAP, onTheMap(), undefined);
    for (const id of ["C", "N", "S", "W", "E", "Eu", "Ed"]) {
      expect(markup).toContain(`data-testid="node-${id}"`);
    }
    expect(markup).toContain('data-state="cleared"');
    expect(markup).toContain('data-state="open"');
    expect(markup).toContain('data-state="locked"');
  });
});

describe("[IS-3.1], [IS-3.2] — a circle for here, arrow-heads for the moves", () => {
  it("marks exactly one level as the one being stood on", () => {
    const markup = mapView(TRAZER_MAP, onTheMap(), undefined);
    expect(markup.match(/data-here="true"/g)).toHaveLength(1);
  });

  it("draws one arrow-head per move out of here, and none for anywhere else", () => {
    // C connects four ways, so standing on it gives four moves.
    const fromC = mapView(TRAZER_MAP, onTheMap(), undefined);
    for (const d of ["up", "down", "left", "right"]) {
      expect(fromC).toContain(`data-testid="move-${d}"`);
    }

    // W is a leaf: one way back and nothing else.
    const fromW = mapView(TRAZER_MAP, step(onTheMap(), "left"), undefined);
    expect(fromW).toContain('data-testid="move-right"');
    expect(fromW).not.toContain('data-testid="move-left"');
    expect(fromW.match(/class="move"/g)).toHaveLength(1);
  });

  it("offers the level under the player as the thing to enter", () => {
    expect(mapView(TRAZER_MAP, onTheMap(), undefined)).toContain('data-action="enter"');
  });
});

describe("[IS-3.8] — the board scales rather than forcing the page wider", () => {
  it("carries a viewBox and no fixed pixel width", () => {
    const markup = mapView(TRAZER_MAP, onTheMap(), undefined);
    expect(markup).toMatch(/viewBox="0 0 \d+ \d+"/);
    expect(markup).not.toMatch(/<svg[^>]*\swidth="/);
  });
});

describe("the map is only the map", () => {
  it("renders nothing while a level is being played", () => {
    expect(mapView(TRAZER_MAP, startRun(TRAZER_MAP), undefined)).toBe("");
  });

  it("shows a notice when given one, and nothing where there is none", () => {
    expect(mapView(TRAZER_MAP, onTheMap(), "Level C is already cleared this run.")).toContain(
      'data-testid="map-message"',
    );
    expect(mapView(TRAZER_MAP, onTheMap(), undefined)).not.toContain('data-testid="map-message"');
  });

  it("escapes level names rather than pasting them into markup", () => {
    // Nothing in the Trazer map needs this, but the level data is authored and will grow.
    const hostile = {
      ...TRAZER_MAP,
      start: "<img>",
      levels: [{ id: "<img>", x: 0, y: 0 }],
      connections: [],
    };
    const run = levelCleared(startRun(hostile));
    expect(mapView(hostile, run, undefined)).not.toContain("<img>");
    expect(mapView(hostile, run, undefined)).toContain("&lt;img&gt;");
  });
});

describe("[IS-3.7] — the stranded map", () => {
  it("still draws every node when nothing is left open", () => {
    let run = onTheMap();
    run = step(goAndClear(run, "up"), "down");
    run = step(goAndClear(run, "down"), "up");
    run = step(goAndClear(run, "left"), "right");
    run = goAndClear(run, "right");
    run = step(goAndClear(run, "up"), "down");
    run = goAndClear(run, "down");
    const markup = mapView(TRAZER_MAP, run, "Every level is cleared.");
    expect(markup).toContain('data-testid="map-message"');
    expect(markup).not.toContain('data-state="open"');
  });
});
