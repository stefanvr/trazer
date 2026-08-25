# Design guide

**Owns.** How the code is shaped: its layering, its seams, and the conventions that keep it tied to
the documents that specify it.

**Not here.** Which technologies were chosen ([tech-spec.md](tech-spec.md)) · *this project's own*
architectural rules, which are its application of what follows (tech-spec's **Architecture**) ·
what any feature does ([domain-spec.md](domain-spec.md),
[implementation-spec.md](implementation-spec.md)) · how work gets done
([workflow.md](workflow.md)).

**Rule of thumb.** A rule belongs here if it would still be true on a completely different project.
If it names a technology, a store, or a domain concept, it is this project's rule and belongs in
tech-spec. *"The domain layer imports no infrastructure"* is here; *"months are integers 1–12
internally"* is not.

**This document ships filled in**, unlike the two specifications. Its content is a standing
preference rather than a per-project decision. Amend it when a convention proves itself; do not
empty it to start.

**Every architectural rule carries its "when not to".** A rule with no stated exception eventually
meets a project it does not fit, gets quietly ignored, and takes the credibility of every other rule
here with it. The exception is what makes the rule survivable.

---

## Every module names the rule it implements

Open each module with a comment naming the rule it implements and the constraint it is under — not a
restatement of what the code does. The code already says that.

**Cite the identifier in brackets.** `tools/spec-coverage.mjs` reads `[DS-n.n]` and `[IS-n.n]` out
of source files to report which rules are implemented as against merely tested. A citation written
any other way — *"domain-spec §4"*, *"per the season rules"* — is invisible to it, so the rule reads
as unimplemented however carefully the comment was written.

```js
// Season resolution — [DS-4.1], [DS-4.2], [DS-4.3].
// Pure: computes a state from a month and the type's reference fields, and writes nothing.
// A planting whose type lacks `rustperiode` resolves to unknown rather than guessing — the gap is
// a question for the owner, not a default to pick.
```

This is the single most valuable convention here, and it is load-bearing in both directions: reading
code, you can find the rule it is meant to satisfy; changing a rule, you can grep for who depends on
it. Without it, documents and code drift silently, and the drift is discovered only when someone
implements against a specification that stopped being true several goals ago.

**When not to.** A module implementing no specified rule — a formatter, a fixture builder, a
adapter that only moves bytes — cites nothing. An invented citation is worse than none, because it
makes the coverage report lie in the direction of comfort.

## Comments explain *why*, and especially "why not the obvious thing"

The diff shows what changed. A comment's job is the reasoning that is not recoverable from reading
the code — most valuably where a naive reading would suggest a different approach, and someone will
otherwise "fix" it back.

Three cases that always earn a comment:

- **A non-obvious constraint** that makes the simple version wrong.
- **A deliberate asymmetry** — two similar things treated differently on purpose. Say why, or it
  reads as an oversight and gets tidied.
- **A shared helper's reason for existing**, especially *"extracted because {other consumer} needs
  the same thing"*, which is invisible from its current single call site.

## Single responsibility, at every level

A function, a module, a document, a commit, a goal. The test is the same each time: **can you name
what it does without using "and"?**

This document set is itself the argument — each document owns one kind of decision, and the whole
thing works because of it.

**When not to.** Splitting something that has one reason to change into two parts produces coupling
with extra steps. Two things that always change together are one thing.

## The domain imports no infrastructure

Domain logic is pure functions over plain types. Anything outside the process — a database, the
network, the clock, the filesystem, the DOM — is reached through an interface the **domain** owns
and an adapter supplies, wired by a factory at the edge.

The payoff is not swappability, which is usually hypothetical. It is that **the domain becomes
testable at all**: rules can be exercised directly, in milliseconds, with no fixture beyond plain
data. Everything else follows from that.

Corollaries worth stating, because each has been violated in a real build:

- **Pure computation lives outside the renderer.** Which cell contains a point, what a set of cells
  outlines, what a month resolves to — these are functions over data, not drawing code. Swapping a
  renderer must be replacing a draw function, not rewriting the interaction.
- **The clock is an input.** Code that reads "now" for itself cannot be tested for what it does in
  March.

**When not to.** A project with exactly one store it will never swap, and no logic worth testing
without it, does not need the seam. Say so in tech-spec in one line — so the next reader sees a
decision rather than an oversight.

## Commands mutate, queries read

CQRS, loosely: separate the code that changes state from the code that reads or renders it.

- **Command and event names are the domain's own.** `domain-spec.md` names a command
  `Record planting` and an event `Planting recorded`; the code says `recordPlanting` and
  `PlantingRecorded`. No translation layer, ever — that shared vocabulary is the entire return on
  writing a domain specification, and it is lost the first time a name is improved in transit.
- **Nothing reads canonical state directly.** Reads go through one projection function. That single
  seam is where filtering lives — permissions, visibility, whatever the domain requires — instead of
  leaking into every renderer and every consumer ad hoc.

**When not to.** A project with no meaningful state transitions — a static site, a calculator — has
no command side to separate, and inventing one is ceremony.

## DRY applies to business rules, not to code that looks alike

Two functions with the same shape and different reasons to change are not duplication. The thing to
deduplicate is the **rule**: one place decides what an overdue loan blocks, and everywhere else asks
it.

**When not to.** Extracting a shared helper from two coincidentally similar call sites couples
things that were never related, and the coupling is discovered later, when one of them needs to
change and cannot.

## Tests mirror the source layout, and are named as the behaviour claimed

`test/{area}/` mirrors `src/{area}/`. Finding a module's tests should require no searching, and a
module with no matching test file should be conspicuous.

Name the test as the behaviour, not the function: *"a boat's reach follows water, not land"* rather
than *"reachableCells works"*. A failing test should describe the broken behaviour in its own name,
before anyone opens the file. Where the behaviour is a specified rule, **lead with its identifier**
so the coverage report can see it.

## Anything random is seeded

Route randomness through a seeded generator rather than the language's global one. A given seed must
reproduce a given result exactly.

This is not only for tests, though it is what makes them possible: it is what lets a bug report be
reproduced, a generated asset be regenerated identically, and a long simulation be re-run to confirm
a fix.

Where two options are equally valid, break the tie **deterministically** — lowest id, first in a
fixed order — rather than leaving it to iteration order that may change. *Equally valid* and
*arbitrary* are different things.

## Dev-only affordances are built, and gated

Build the things that make development and testing bearable, and make them obviously
non-production:

- A **fixed fixture state**, to jump straight to an interesting situation instead of setting it up
  by hand every time.
- **Preview or reference pages** rendering real output from the real code.
- A **gate** — a URL flag, an environment check — so they never ship enabled.

Document them in the README as you build them; they are forgotten within a month otherwise, and
rediscovered by accident much later.

When a fixture needs a situation the normal generation path cannot produce, hand-construct it
*after* the normal path has run, and **verify the construction** rather than trusting coordinates
worked out by hand. A fixture that is subtly wrong costs more than no fixture.

## Scratch work leaves no trace

Throwaway verification scripts are encouraged — see workflow.md's verification step — but delete
them in the same session. A `_probe.js` left behind reads as real code to the next person, and to
the next session. Write their output somewhere the project does not serve or watch.
