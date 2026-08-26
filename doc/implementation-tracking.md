# Implementation tracking

**Owns.** What is being built now, what is agreed next, what is deliberately set aside.

**Not here.** How work gets done ([workflow.md](workflow.md)) · what the product does
([domain-spec.md](domain-spec.md)) · how it behaves ([implementation-spec.md](implementation-spec.md)).

**The deletion rule.** Everything under a goal is scaffolding. When a goal lands, its text is
deleted and only a row in **Done** remains. That is only safe because anything learned was
promoted into the document that owns it first — see workflow.md's *Promote before you tick*. The
test is mechanical: delete the text, and see whether anything is now missing.

**WIP limit: one goal in Now.** A second goal in progress means neither is being finished.

---

## Now

### Goal: a player can start a game, cross the map, and reach an ending — without a ball existing yet

**Sign-off:** ☑ 2026-08-25. Specification input was given at the gate and is recorded below; the map
and the navigation shapes came from it, and an opening screen with mode options was raised and
withdrawn as feature creep.

The walking skeleton. It makes the *run* real — lives, navigation, open-for-play, the run ending —
while costing nothing in physics, because the level is stubbed to the only two outcomes `DS-1.14`
allows it. Those outcomes are buttons, which is not a fake standing in for a level: it is the
domain's own boundary made pressable, and the arena goal replaces the buttons behind an interface
that does not change.

**Checklist** — each item one commit's worth, and each committable without the next:

- [x] **The map, and what it opens** — the derivation opens nothing from an empty cleared set, so the
      start level must be seeded → `domain-spec.md` **DS-1.9** and its derivation block.
- [ ] **The run.** Lives, the two level outcomes, the run ending, and starting already on an open
      level. Pure. `DS-1.1`, `DS-1.4`, `DS-1.6`, `DS-1.14`.
- [ ] **Aborting.** Available from every state, ending the game without success. `DS-1.13`.
- [ ] **The map screen.** Renders each node as cleared, open or locked; steps; enters. Adapter over
      the pure core.
- [ ] **The stub level and the endings.** Two buttons emitting the level's two outcomes, plus the
      run-ended screen and starting a new game.
- [ ] **The journey, end to end.** Playwright across §2, §3 and §4, with the existing build-identifier
      and phone no-horizontal-scroll assertions still passing against the new interface.

**Try it.** Open the deployed page. You begin already playing the start level. Press **clear level**
and its neighbours open; step back onto it and nothing restarts, because it is cleared for this run
(`DS-1.8`); step to a neighbour and enter it. Press **lose a life** three times and the run ends,
offering a new game (`DS-1.4`). Abort mid-level and you reach the same ending by another route. The
build identifier at the foot of the page still matches `main`.

**Covers.** `DS-1.1`, `DS-1.4`, `DS-1.6`, `DS-1.7`, `DS-1.8`, `DS-1.9`, `DS-1.13`, `DS-1.14`.

**Deliberately not covered, though they are area 1 rules.** `DS-1.15` and `DS-1.16` describe what
survives inside a level, and a level made of two buttons has nothing inside it to survive. Claiming
them would make the coverage report lie in the direction of comfort. `DS-1.2` is absent because no
mode is ever selected. All three belong to later goals.

**What already exists and must be reused rather than repeated:**

- **`src/build-info.ts` and its end-to-end assertion.** Whatever replaces the placeholder page must
  keep rendering the build identifier, because `e2e/smoke.spec.ts` asserts it is present and not
  `unknown`. A deploy that cannot be checked against `main` is the one regression this must not
  introduce.
- **The phone no-horizontal-scroll assertion**, which now applies to a map of nodes — exactly the
  kind of thing that overflows a narrow viewport.
- **`design-guide.md`'s domain seam.** The run is a state machine over plain data and the DOM is an
  adapter at the edge, which is what lets Vitest carry the coverage rather than Playwright, as
  `tech-spec.md`'s testing strategy commits to.
- **The `[DS-n.n]` citation format**, in module headers and leading test names, or
  `npm run spec:coverage` reports this goal as having implemented nothing.

**Specification input, given at the sign-off gate.** `/build-stage` writes §2, §3 and §4 of
`implementation-spec.md` with this rather than rediscovering it.

- **The map is seven levels, and it is the real map for now** — not a development fixture to be
  thrown away. Five form a plus; the right-hand leaf carries one level above and one below.
  Connections: `W–C`, `C–N`, `C–S`, `C–E`, `E–Eu`, `E–Ed`.

  ```
         N          Eu
         |          |
   W --- C --- E ---+
         |          |
         S          Ed
  ```

- **A run starts at `C`, the centre.** Clearing it opens all four arms at once; clearing `E` then
  opens `Eu` and `Ed`. Widest choice immediately, depth three.
- **In navigation, the current level is a circle or sphere, and the moves out of it are arrow-head
  triangles** pointing the way they lead. The shapes are the behaviour and belong in §3; their
  colours and sizes belong in `style-guide.md`, which stays empty until there is something worth
  looking at.
- **No opening screen and no mode options.** Raised and withdrawn as feature creep: Journey's
  substance is persistence, which is a later goal, so a mode chooser here would offer a choice that
  changes nothing. Arcade is hardcoded and `Select mode` is not implemented.
- **Animation is deferred**, consistent with **Parked**.

**A consequence of seven levels and no end level.** A player who clears all seven with lives to spare
has nowhere left to go: `DS-1.8` closes each cleared level for the rest of the run, and the end level
belongs to a later goal. The map will show everything cleared and nothing open, and **abort is the
only way out** — a second reason adopting `DS-1.13` here was right. This is the honest shape of the
slice rather than a defect, and the end-level goal removes it.

---

## Planning

*Empty. Goals are planned one at a time, when they are about to be built.*

---

## Backlog

Goals, not tasks. Each is one line stating an outcome; it gets its checklist when it reaches
Planning, not before.

Sliced from the backbone in [implementation-spec.md](implementation-spec.md). Each slice crosses
every activity it can; none of them is a layer.

- [ ] **A player can actually play a level.** The arena replaces the stub: a bat, a ball, bricks, one
      hazard edge. The two buttons become the two real events, and nothing above the level changes.
      - **Blocked on the arena being stormed.** `implementation-spec.md`'s *Play a level* journey
        currently cites almost nothing, because `domain-spec.md` has no arena area. Run
        `/event-storm` on it before this is planned, or the goal will invent domain rules during
        implementation and have to promote them afterwards.
- [ ] **A player's progress survives dying.** Journey mode and the mode choice that selects it, with
      cleared levels persisting between runs and the unlocked set derived from them (**DS-1.9**).
      Proves `DS-1.5` and `DS-1.3`, the half of the mode distinction the skeleton deliberately left
      out.
- [ ] **A player can reach the end of the map.** A real branching map, the two end-level conditions
      (**DS-1.10**, **DS-1.11**), and `Game finished`. Needs **[H2]** settled first — nothing yet
      says what makes an Arcade route a designated one.

---

## Parked

Real, decided against for now, with what would unpark it.

- [ ] **Power-up capsules.** Eight of them in the frozen draft, with a scope taxonomy the author
      already revised once. Nothing about them is decidable until a ball, a bat and a brick exist to
      be modified. Unpark once the arena goal has landed.
- [ ] **Score.** Described in the draft and deliberately not stormed — it is **[H4]** in
      `domain-spec.md`. It also interacts with `DS-1.3`: if Journey clears persist, whether
      re-clearing a level scores again is undecided. Unpark with a scoring session, after the arena.
- [ ] **Sound and animation cues.** The draft pairs an audio and a visual cue with all sixteen core
      events, and `style-guide.md` maps motion primitives to nine of them. Entirely presentation, and
      worth nothing until the events it decorates actually fire. Unpark after the arena goal.
- [ ] **The level editor.** The draft's own §9 lists it as a future idea. It needs the level data
      shape to be settled first, which the map goal will do. Unpark when someone other than the
      author wants to author a level.

---

## Release gap

Domain areas with no goal in any state. Maintained by `/sanity-check` once `domain-spec.md`
carries identifiers — until then, deliberately empty rather than guessed at.

`domain-spec.md` has one area, *The run*, and every rule in it is now claimed by a goal. `DS-1.13`,
aborting a game, briefly was not: no journey passed through it and no slice contained it, which is
how it went unnoticed until the `DS-` citations were cross-checked between documents by hand. It was
adopted into the goal in **Now** at the planning gate, where it is nearly free — that slice has every
state abort is reachable from, and **[H3]** cannot bite while nothing is persisted.

Worth keeping as a note on method: nothing in the toolchain found this. `npm run spec:coverage`
compares rules against code and tests, not against journeys and goals, so a rule that no goal claims
is invisible to it right up until the release it is missing from.

**The gap runs the other way, and is worth naming here because nothing else reports it.** The
backbone's largest activity, *Play a level*, has **no domain area at all** — the arena was never
stormed. Two goals above depend on it and one is explicitly blocked on it. This is not a release gap
but a specification gap, and `/sanity-check` will not find it, because a section that does not exist
has no identifiers to go missing.

---

## Done

| Goal | Landed | Knowledge promoted to |
|---|---|---|
| — | | |
