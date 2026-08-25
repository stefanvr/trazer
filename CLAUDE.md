# Orientation

This project keeps its decisions in `doc/`. Each document owns exactly one kind of decision, and
the skills in `.claude/skills/` are how those documents get written and kept true.

## Before you do anything

Read the **Owns / Not here** header of any document you are about to change. If what you are about
to write does not belong there, it belongs somewhere else in this set — find that place rather
than adding a section.

| If you are deciding... | It goes in |
|---|---|
| what the product does, or a rule it obeys | `doc/domain-spec.md` |
| how something is presented or operated | `doc/implementation-spec.md` |
| which technology, and what was rejected | `doc/tech-spec.md` |
| how code is structured or layered | `doc/design-guide.md` |
| what something looks like | `doc/style-guide.md` |
| what has to be true of the machine | `doc/environment.md` |
| how work gets done | `doc/workflow.md` |
| what gets built next | `doc/implementation-tracking.md` |

## Standing rules

- **One goal in progress.** `doc/implementation-tracking.md` has a WIP limit of one goal in
  **Now**. Do not start a second.
- **Promote before you tick.** Anything learned while doing the work goes into the document that
  owns it *before* the checklist item is checked off. Tracking text is deleted when a goal lands,
  so an unpromoted lesson is a lost one.
- **Rules carry identifiers.** Rules in `domain-spec.md` are `DS-n.n`, behaviours in
  `implementation-spec.md` are `IS-n.n`. Tests cite them in their names. `npm run spec:coverage`
  reports rules with no test and tests citing rules that no longer exist.
- **Every module names the rule it implements.** An opening comment that gives the section or
  identifier, and the constraint it is under — not a restatement of what the code does. This is
  what stops documents and code drifting apart silently.
- **Reasoning does not go in a specification.** Discovery and analysis live in `doc/discovery/`,
  frozen. A specification states what is true; where a decision needs justifying, one sentence
  in place, not a section.
- **Do not use `bash -lc` for anything in this repository.** See `doc/environment.md`; a login
  shell silently reaches the wrong toolchain.

## Which skill

| Situation | Skill |
|---|---|
| Starting out, or looking at prior data or a previous attempt | `/discover` |
| Working out what the product actually is | `/event-storm` |
| Working out how it is used, and what to build first | `/story-map` |
| Deciding what the next goal is and agreeing it | `/plan-goal` |
| Building the goal in **Now** | `/build-stage` |
| Suspecting the documents have drifted from the code | `/sanity-check` |
| Setting up or changing the toolchain | `/scaffold` |
