// The application shell — [IS-1.1], [IS-1.2], [IS-3.4], [IS-3.5], [IS-3.6], [IS-3.7].
//
// This is the adapter design-guide.md's domain seam calls for: the only file that touches the DOM,
// holds mutable state, or listens for anything. Every rule it enforces lives in src/domain and is
// tested without a browser; what is here is wiring, and it is deliberately dull.
//
// Re-rendering replaces the whole view on each action rather than patching it. At seven nodes the
// cost is nothing, and the alternative — tracking which parts changed — is where a bug would hide
// that no domain test could see.

import { TRAZER_MAP } from "../domain/trazer-map";
import type { Direction } from "../domain/map";
import type { Run } from "../domain/run";
import {
  abortGame,
  chooseLevel,
  isOver,
  levelCleared,
  lifeLost,
  openLevels,
  startLevel,
  startRun,
  whyClosed,
} from "../domain/run";
import { buildInfo, formatBuildInfo } from "../build-info";
import { mapView } from "./map-view";
import { levelView } from "./level-view";
import { endingView } from "./ending-view";

const ARROW_KEYS: Readonly<Record<string, Direction>> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

/**
 * What the map should say beneath itself, if anything.
 *
 * `refusal` is transient — it exists only until the next action — while the stranded notice is a
 * property of the state and returns every render. Keeping both in one function is what stops them
 * being rendered on top of each other.
 */
function noticeFor(run: Run, refusal: string | undefined): string | undefined {
  if (refusal) return refusal;
  // [IS-3.7] — nothing open and the run still alive. Silence here would read as a broken map.
  if (run.phase.kind === "navigating" && openLevels(TRAZER_MAP, run).length === 0) {
    return "Every level is cleared and there is no end level yet. Abandoning the game is the only way on.";
  }
  return undefined;
}

export function mountApp(root: HTMLElement): void {
  // [IS-1.1] — a game is created and a run started on load. Arcade is fixed, not chosen.
  let run = startRun(TRAZER_MAP);
  let refusal: string | undefined;

  function render(): void {
    const notice = noticeFor(run, refusal);
    root.innerHTML =
      mapView(TRAZER_MAP, run, notice) +
      levelView(run) +
      endingView(run) +
      // [IS-1.2] — on every screen, not only the first. It is what makes the deploy checkable.
      `<p class="build" data-testid="build-info">${formatBuildInfo(buildInfo())}</p>`;
  }

  /** Entering the level under the player, or saying which of the two reasons it will not open. */
  function enterHere(): void {
    if (run.phase.kind !== "navigating") return;
    const here = run.phase.at;
    const next = startLevel(TRAZER_MAP, run);
    if (next !== run) {
      run = next;
      refusal = undefined;
      return;
    }
    // [IS-3.5] — the two reasons look identical on the map and lead to opposite actions.
    const closed = whyClosed(TRAZER_MAP, run, here);
    refusal =
      closed === "cleared"
        ? `Level ${here} is already cleared this run. Step somewhere new.`
        : `Level ${here} is not unlocked yet. Clear a level next to it first.`;
  }

  function step(direction: Direction): void {
    const next = chooseLevel(TRAZER_MAP, run, direction);
    // A step that goes nowhere leaves any standing refusal alone rather than clearing it silently.
    if (next !== run) refusal = undefined;
    run = next;
  }

  root.addEventListener("click", (event) => {
    const target = event.target as Element | null;
    const actor = target?.closest("[data-action]");
    if (!actor) return;
    const action = actor.getAttribute("data-action");
    switch (action) {
      case "clear":
        run = levelCleared(run);
        refusal = undefined;
        break;
      case "lose":
        run = lifeLost(run);
        break;
      case "abort":
        run = abortGame(run);
        break;
      case "new-game":
        // [DS-1.4], [DS-1.1] — a new game with lives restored and nothing carried over.
        run = startRun(TRAZER_MAP);
        refusal = undefined;
        break;
      case "enter":
        enterHere();
        break;
      case "step": {
        const direction = actor.getAttribute("data-direction");
        if (direction) step(direction as Direction);
        break;
      }
      default:
        return;
    }
    render();
  });

  // [IS-3.6] — the keyboard route. It exists because the arena will need one, and a map that could
  // only be clicked would strand the player between two input models.
  root.ownerDocument.addEventListener("keydown", (event) => {
    if (isOver(run) || run.phase.kind !== "navigating") return;
    const direction = ARROW_KEYS[event.key];
    if (direction) {
      event.preventDefault();
      step(direction);
      render();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      enterHere();
      render();
    }
  });

  render();
}
