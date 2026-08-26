// The ending screen — [IS-4.1], [IS-4.2], [IS-4.3].
//
// Pure: state in, markup out.
//
// [IS-4.3] is the reason `because` exists on the run at all. A player who abandoned a game and one
// who ran out of lives have reached the same state by different routes, and telling them the same
// thing would be wrong for both — one wants to know the run is over, the other already knows.
//
// There is no success ending here. [DS-1.12] makes clearing the end level the only one, and this
// release has no end level, so every ending this file renders is a game that did not succeed.

import type { Run } from "../domain/run";
import { levelsCleared } from "../domain/run";

export function endingView(run: Run): string {
  if (run.phase.kind !== "ended") return "";
  const cleared = levelsCleared(run);
  const abandoned = run.phase.because === "abandoned";
  const heading = abandoned ? "Game abandoned" : "Out of lives";
  const detail = abandoned
    ? "You left before the run was over."
    : "The last life went, and with it the run.";
  return (
    `<section class="ending" data-testid="ending">` +
    `<h1 data-testid="ending-reason" data-because="${run.phase.because}">${heading}</h1>` +
    `<p>${detail}</p>` +
    `<p data-testid="levels-cleared">Levels cleared: <strong>${cleared}</strong> of 7</p>` +
    // [DS-1.4] — in Arcade the run was the game, so what follows is a new game, not a new run.
    `<button type="button" data-action="new-game" data-testid="new-game">New game</button>` +
    `</section>`
  );
}
