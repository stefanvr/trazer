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

- [ ] **A player can actually play a level.** The arena replaces the stub: a bat, a ball, bricks, one
      hazard edge. The two buttons become the two real events, and nothing above the level changes.
      - **Blocked on the arena being stormed.** `implementation-spec.md`'s *Play a level* journey
        currently cites almost nothing, because `domain-spec.md` has no arena area. Run
        `/event-storm` on it before this is planned, or the goal will invent domain rules during
        implementation and have to promote them afterwards.
      - **Carries two rules the skeleton could not finish.** `DS-1.15` is implemented and untested —
        a level of two buttons has no progress to survive a lost life, so only half the rule could be
        exercised. `DS-1.16`, that a level re-entered starts from its opening state, is not
        implemented at all for the same reason. Both need a level with something inside it, and this
        is the goal that gives them one.
      - **Retires `IS-2.4`**, the two controls. `IS-2.1` to `IS-2.3` — the level's outcomes, its name
        and lives, and a lost life being a continuation — stay true and must keep passing.
- [ ] **A player's progress survives dying.** Journey mode and the mode choice that selects it, with
      cleared levels persisting between runs and the unlocked set derived from them (**DS-1.9**).
      Proves `DS-1.5` and `DS-1.3`, the half of the mode distinction the skeleton deliberately left
      out.
- [ ] **A player can reach the end of the map.** A real branching map, the two end-level conditions
      (**DS-1.10**, **DS-1.11**), and `Game finished`. Needs **[H2]** settled first — nothing yet
      says what makes an Arcade route a designated one.
      - **Removes the stranded map.** `IS-3.7` exists because clearing every level with lives to
        spare currently leaves nowhere to go and abort as the only exit. Once there is an end level
        that state becomes reachable-and-answered rather than a dead end, and `IS-3.7` should be
        revisited rather than quietly left behind.

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

`domain-spec.md` has one area, *The run*, and every rule in it is claimed by a goal or already built.
`DS-1.13`, aborting a game, briefly was not: no journey passed through it and no slice contained it,
which is how it went unnoticed until the `DS-` citations were cross-checked between documents by
hand. It was adopted into the walking skeleton at the planning gate, where it was nearly free, and
has shipped. **[H3]** — whether aborting keeps Journey progress — is still open, and cannot bite
until something is persisted.

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
| A player can start a game, cross the map, and reach an ending — without a ball existing yet | 2026-08-26 | `domain-spec.md` (**DS-1.9** — the start level is unlocked unconditionally, since the derivation opens nothing from an empty cleared set; **DS-1.13** — *from any state* means never unavailable, not overwriting an ending already reached) · `tech-spec.md` **Architecture** (no `Game` type while Arcade is the only mode; the mode is not a parameter of the domain functions) · `workflow.md` §4 (two items that cannot both be reached are one item — the reachability clause on the commit-separately test) · `design-guide.md` §Tests (identifiers in test names must be **bracketed** or the coverage tool cannot see them, and it scans whole files, so over-citing is as bad as under-citing) · `implementation-spec.md` §1–§4 (seventeen `IS-` behaviours; `IS-2.4` marked for retirement when the arena arrives) · **Backlog** (the arena goal carries `DS-1.15` and `DS-1.16`, which a stub level could not finish; the end-level goal revisits `IS-3.7`) |
