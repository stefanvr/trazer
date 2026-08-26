# Trazer — Technical specification

**Owns.** What this is built with, and which trade-offs were accepted to build it that way —
including **this project's own architectural rules**.

**Not here.** What the product does ([domain-spec.md](domain-spec.md)) · how it is operated
([implementation-spec.md](implementation-spec.md)) · what has to be true of the machine
([environment.md](environment.md)) · **the universal shape of the code**
([design-guide.md](design-guide.md)).

**Rule of thumb.** A choice belongs here if a different team could have decided differently and
still built the same product. If changing it would change what the product *does*, it is a domain
decision, not a technical one.

**Where this ends and design-guide begins.** design-guide holds what would still be true on a
completely different project — *the domain layer imports no infrastructure*. This document holds
**this project's application of that**, and its own rules besides. When a rule names a technology,
a store or a domain concept, it is this project's, and it goes here.

**Every choice names what it beat.** A technology listed without its rejected alternatives is
folklore — nobody can tell whether it was chosen or merely reached for, and nobody can revisit it
without redoing the whole analysis. One clause per rejection is enough.

Written by `/scaffold` for the initial stack, and extended per goal as further choices are made.

---

## The stack

| Concern | Chosen | Rejected, and why |
|---|---|---|
| Language | TypeScript 7, strict | JavaScript — a simulation with per-frame state is exactly where an unchecked field name costs an evening |
| Build | Vite 8 | Bare `tsc` plus a static server — no dev server, no asset hashing; Webpack — a configuration budget a game skeleton does not have |
| Unit tests | Vitest 4 | Jest — a second transform pipeline alongside Vite's, for no gain here |
| End-to-end tests | Playwright 1.62, Chromium only | Cypress — heavier, and the multi-viewport case is what this suite exists for; more browsers — cost per run without a second rendering target yet |
| Hosting | GitHub Pages, project page at `/trazer/` | Netlify or Vercel — another account and another credential for a static bundle Pages serves for free |
| CI | GitHub Actions, deploy on push to `main` | Deploying by hand — the failures this catches are the ones no local test can see |

Applied from the `vite-ts` recipe. Its `RECIPE.md` carries the reasoning for the shape; what is
recorded here is what this project decided differently.

## Tooling

The commands, named the same in every project so muscle memory transfers.

- **Dev:** `npm run dev` — Vite dev server with hot module replacement.
- **Tests:** `npm test` — runs **two** runners, because there are two kinds of code here:
  `test:unit` (Vitest, over `test/**/*.test.ts`) covers application logic, and `test:tools`
  (`node --test`, over `tools/**/*.test.mjs`) covers the shipped tooling. `npm test` is the single
  name that runs both, so CI needs no separate step and neither does anyone else.
- **E2E:** `npm run test:e2e` — Playwright against the **built** output at two viewports, deliberately
  thin. The dev server serves unbundled modules under a different `base`, so a test passing there
  can still fail on the deployed site.
- **Typecheck:** `npm run typecheck` — `tsc --noEmit`.
- **Coverage:** `npm run spec:coverage` — rules with no test, and tests citing rules that no longer
  exist.

## Architecture

Deliberately near-empty. Nothing has been designed yet: the domain does not exist, and a rule
written now would be a guess dressed as a constraint. `/event-storm` and the first build goal fill
this in.

One rule holds already, because the skeleton depends on it:

- **The build identifier degrades, never throws.** `src/build-info.ts` reads compile-time constants
  that are absent under unit tests and absent outside a git repository. Any module reading them
  falls back to `unknown` rather than failing. An identifier that breaks the page it exists to
  describe is worse than no identifier at all.

- **There is no `Game` type, and its absence is deliberate.** `DS-1.4` makes a game hold exactly one
  run in Arcade, so while Arcade is the only mode a run ending *is* the game ending and the two are
  the same object. Journey is where they come apart (`DS-1.5`), and that goal introduces the split.
  Building the seam now would mean a `Game` wrapping a `Run` with nothing on the other side of it —
  a layer that exists to be passed through, which is harder to remove later than to add.
- **The mode is not a parameter of the domain functions.** `DS-1.9` is one derivation for both modes,
  differing only in which cleared set is passed in. Threading a mode through the map and run
  functions would put the distinction in the wrong place and have to be unpicked when Journey lands.

**Known to be coming, and deliberately not decided here:** the rendering surface (canvas versus
DOM), the fixed-versus-variable timestep, and where collision lives. All three need the domain
first — see **Future direction**.

---

## Decisions

### Take the `vite-ts` recipe unchanged, rather than making the skeleton game-shaped now

**Chosen:** the recipe as it ships — a DOM page rendering a build identifier, one unit test, three
end-to-end assertions.

**Why:** the skeleton exists to prove the pipeline, not to begin the game. Swapping the placeholder
page for a `<canvas>` and a `requestAnimationFrame` loop during scaffolding would settle the two
most consequential design questions in the project — the rendering surface and the timestep — before
a single domain rule exists, and settle them silently, as a side effect of setting up a toolchain.

**Rejected:** canvas and frame loop during scaffold — decided on vibes, in the one session where
nobody is thinking about the domain, and thereafter never revisited because it was already there.

**Accepted risk:** the first real goal does more work than it otherwise would, since it introduces
the surface as well as the behaviour. That is the correct place for the cost to land.

### Install current majors rather than the versions the recipe names

**Chosen:** Vite 8, Vitest 4, TypeScript 7, Playwright 1.62, resolved at scaffold time.

**Why:** `RECIPE.md` is explicit that its versions are a starting point rather than a decision, and
that a recipe pinning the past is how a template starts costing more than it saves. The recipe named
Vite 5, Vitest 2 and TypeScript 5.6; all three are majors behind.

**Rejected:** the recipe's literal versions — would have handed a brand-new project a
two-major-version upgrade as its first maintenance task.

**Accepted risk:** TypeScript 7 is the native compiler port and the newest of these by some margin.
Taken deliberately and **verified rather than assumed** — `npm run typecheck` passes clean on the
recipe's source, which exercises `verbatimModuleSyntax`, `isolatedModules` and ambient
`declare const`. If it bites, TypeScript 6.0.3 is the fallback and nothing else in the stack depends
on the choice.

### Run the shipped tooling's own tests under `npm test`

**Chosen:** `npm test` runs Vitest and then `node --test "tools/**/*.test.mjs"`.

**Why:** the recipe wired `test` to `vitest run` alone, and Vitest's `include` is
`test/**/*.test.ts`. `tools/spec-coverage.test.mjs` therefore ran nowhere — not locally, not in CI —
despite the template shipping it specifically so that a project adjusting the `specCoverage` globs
has the tests that catch it breaking them. Seven passing tests nobody executes are indistinguishable
from no tests at all.

`tools/` uses Node's built-in runner rather than Vitest, deliberately: it lets the template verify
its own tooling without acquiring a dependency to do it. That is a good reason for two runners, and
no reason at all for one of them to be unreachable.

**Rejected:** widening Vitest's `include` to cover `tools/` — the tools are plain ESM with no
transform, and pulling them into the bundler's test pipeline makes them depend on the thing they are
meant to check independently. Also rejected: a separate CI step, which would leave the local
`npm test` still lying about what it covers.

**Accepted risk:** `npm test` is now two sequential runners, so a failure in the first hides results
from the second. Acceptable at this size; the two report separately and both are fast.

### Pin `@types/node` to the Node major, not to its own latest

**Chosen:** `@types/node@^24`, matching `.nvmrc`.

**Why:** `@types/node` majors track Node majors. Its latest is 26, which would have typechecked this
project against APIs the Node 24 it actually runs on does not have — a green typecheck describing a
runtime that is not there.

**Rejected:** `@types/node@^26` — newest, and wrong.

**Accepted risk:** none material. Bumping `.nvmrc` means bumping this in the same commit, which is
where the coupling is visible anyway.

---

## Testing strategy

- **Vitest carries the bulk.** Game logic — collision, scoring, level state — is pure computation
  over values, so it is cheap and deterministic to test directly. This is where a simulation's tests
  belong, and where they should stay.
- **Playwright is deliberately thin.** Reserved for the wiring the fast layer structurally cannot
  see: that the page renders, that the build identifier was really injected, and that nothing forces
  a phone to scroll sideways. It is not where game rules get tested.

Keeping the slow layer thin is a decision that has to be defended repeatedly, because every new
feature suggests one more end-to-end test. For a game the temptation will be strong and specific —
*play a level in the browser and assert the score* — and it should be resisted: that test is slow,
flaky, and tells you less than the unit test of the same rule.

---

## Accepted risks

- **Chromium only in end-to-end tests.** Costs coverage of Safari and Firefox rendering · bites when
  a canvas or audio API diverges between engines, which for a game is a real rather than theoretical
  risk · worth revisiting once the game renders something and a second engine can be checked by hand.
- **No linter or formatter.** Costs consistency arguments · bites when a second contributor joins ·
  the recipe leaves this out on purpose, as a preference it should not impose.
- **Deploying every push to `main`, with no staging step.** Costs the ability to hold a broken build
  back · bites only if the pipeline's own gates pass something broken · tolerable because typecheck,
  unit tests and end-to-end tests all run before anything is published.

## Future direction

- **`src/build-info.ts` is separate from `src/main.ts`.** Looks redundant for two constants. It
  exists so the identifier can be rendered by whatever the first real screen turns out to be —
  including a canvas, which cannot use the current `innerHTML` path at all — without the
  deploy-confirmation test changing.
- **`base` read from `VITE_BASE` rather than hardcoded to `/trazer/`.** Looks like indirection for
  one value. It exists so moving to a custom domain or a user site is an environment change rather
  than a source change.

**Explicitly out of scope:** any rendering surface, game loop, input handling, audio, persistence,
or framework. None of these is overlooked — none has a domain rule behind it yet.
