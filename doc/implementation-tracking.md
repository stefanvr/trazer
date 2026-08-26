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

*Empty. Nothing is in progress. `/plan-goal` takes the next goal from Backlog.*

---

## Planning

*Empty. Goals are planned one at a time, when they are about to be built.*

---

## Backlog

Goals, not tasks. Each is one line stating an outcome; it gets its checklist when it reaches
Planning, not before.

Sliced from the backbone in [implementation-spec.md](implementation-spec.md). Each slice crosses
every activity it can; none of them is a layer.

- [ ] **A player can start a game, work their way across the map, and reach an ending — without a
      ball existing yet.** The walking skeleton. The level is stubbed to the only two outcomes the
      domain gives it (**DS-1.14**): two buttons, `Level cleared` and `Life lost`. Arcade only, no
      mode choice, a handful of hardcoded nodes.
      - **Why the stub is not a cheat:** `DS-1.14` says a level ends exactly two ways, so a button
        per outcome is the domain's own boundary made pressable rather than a fake standing in for
        one. Everything above the level — lives, navigation, open-for-play, the run ending — becomes
        real and testable with no physics written.
      - **What it proves that nothing else will:** `DS-1.7` free stepping, `DS-1.8` open-for-play
        scoped to the run, `DS-1.1` lives as a run budget, and `DS-1.4` the run ending being the game
        ending in Arcade. These are the rules most likely to be wrong, and they are cheapest to find
        wrong here.
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

`domain-spec.md` has one area, *The run*, and every rule in it is claimed by a goal above **except
one**: `DS-1.13`, aborting a game. No journey passes through it and no slice contains it, which is
how it went unnoticed until the citations were cross-checked. It is small, but it is reachable from
every state in the game, and **[H3]** does not yet say whether aborting a Journey game keeps the
progress earned. It needs a home before the Journey goal is planned.

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
