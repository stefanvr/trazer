// The level screen — [IS-2.1], [IS-2.2], [IS-2.4].
//
// Pure: state in, markup out. The two controls are [IS-2.4], the placeholder standing in for an
// arena that has not been specified. They are the slice's real content rather than a development
// shortcut, so design-guide.md's rule about gating dev affordances does not apply and they ship
// visible — a walking skeleton that hid its only interaction would prove nothing.
//
// When the arena is built, IS-2.4 is retired and this file loses its two buttons. What it must keep
// is [IS-2.2]: the level's own name and the lives remaining. The map is not visible from in here,
// so without the name the player cannot tell where they are.

import type { Run } from "../domain/run";

export function levelView(run: Run): string {
  if (run.phase.kind !== "playing") return "";
  const lives = run.livesRemaining;
  return (
    `<section class="level" data-testid="level">` +
    `<h1 data-testid="level-name">Level ${run.phase.level}</h1>` +
    `<p class="lives" data-testid="lives">Lives left: <strong>${lives}</strong></p>` +
    `<p class="placeholder">There is no arena yet. A level ends exactly two ways, so here they are ` +
    `as buttons.</p>` +
    `<div class="controls">` +
    `<button type="button" data-action="clear" data-testid="clear-level">Clear level</button>` +
    `<button type="button" data-action="lose" data-testid="lose-a-life">Lose a life</button>` +
    `</div>` +
    `<button type="button" class="quiet" data-action="abort" data-testid="abort">Abandon game</button>` +
    `</section>`
  );
}
