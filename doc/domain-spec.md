# {Project} — Domain specification

**Owns.** What this thing *is* and the rules it obeys, independent of how it is built. Written so
someone could reason about the product — or play the game, or work the process — without reading a
line of code.

**Not here.** Technology ([tech-spec.md](tech-spec.md)) · how it is presented or operated
([implementation-spec.md](implementation-spec.md)) · what it looks like
([style-guide.md](style-guide.md)) · what gets built when
([implementation-tracking.md](implementation-tracking.md)) · **the research that led here**
([discovery/](discovery/), frozen).

**Rule of thumb.** If changing it would change *what the product does*, it belongs here. If
changing it would only change *how the product is made*, it does not.

**Identifiers.** Every numbered block carries a `DS-n.n`. Tests cite them by name, and
`npm run spec:coverage` reports rules with no test and tests citing rules that no longer exist.
A live identifier is never renumbered or reused — it is retired, and the retirement says why.

**Vocabulary is shared with the code.** An event named here is the event name in the code, and a
command named here is the command name. `Planting recorded` becomes `recordPlanting` and
`PlantingRecorded`; nothing gets renamed on the way in. This is the whole return on writing a
domain specification, and it is lost the first time a translation layer appears.

Written by `/event-storm`, one area at a time.

---

## Block types

Each area is written from a closed set of blocks. The set is closed so that the question *"which
kind of thing is this?"* has an answer, and so that anything not fitting is visible rather than
disguised.

| Block | Holds | Written as |
|---|---|---|
| **FLOW** | the timeline for this area | events in the order they occur, past tense |
| **COMMAND** | something an actor asks for | actor · what must hold · what it emits |
| **EVENT** | something that became true | past tense, named as the domain names it |
| **POLICY** | an automatic reaction | when {event, or time}, then {command} |
| **RULE** | an invariant that always holds | the statement, its exception, and why the exception exists |
| **DERIVATION** | pure computation, no state change | inputs → output, with precedence stated |
| **REFERENCE** | taxonomy and per-type values | a table |
| **READ** | a question the domain must be able to answer | who asks it, and what they need to see |

### When it does not fit

**Not everything is a command and an event, and forcing it is the main way event storming goes
wrong.** Structural facts, pure calculations, reference tables and product-wide constraints are
all real domain content with no event in sight. Three of these are load-bearing in the projects
this template came from: a season resolver that computes a state from a month and never writes
anything, a movement-reach function over terrain costs, and *"the product never blocks on an
unanswered question"* — a constraint on everything, attached to nothing.

**The fallback is RULE**, and it carries an identifier like every other block, so coverage and
traceability are unaffected by which shape a thing took. DERIVATION is the fallback for anything
that computes rather than happens.

A **ceremonial sticky** is one invented to satisfy the format. Three symptoms, all mechanical
enough that `/sanity-check` reports them:

- an event nothing subscribes to, and that nothing outside its own aggregate can observe;
- a command whose only actor is "the system", with no policy triggering it;
- an event named as a noun plus *Updated* or *Changed*, which is a database row talking, not a
  domain.

When you find one, delete it and write the rule it was standing in for.

---

## 1. {Area}

**FLOW**

**COMMAND — {name}**
*Actor:* · *Requires:* · *Emits:*

**RULES**

- **[DS-1.1]** {A rule that always holds.}
- **[DS-1.2]** {A rule with its exception named explicitly, plus why the exception exists — which
  is usually the part that stops it being "fixed" later by someone who missed it.} [?H1]

---

## Open items

The unresolved arguments — event storming's hotspots. **One list for the whole document**, so the
review queue is visible in one place; areas above point at it with `[?Hn]` rather than restating.

Each says what is currently true, what the alternative is, and what would settle it. Keeping them
here rather than in someone's head is what stops them being silently re-decided by whoever touches
that code next.

- **[H1]** {The question.} Currently {behaviour}. The alternative is {alternative}, which would
  {effect}. Settled by {what would settle it}.

An open item is closed by writing the decision into the rule it troubled and deleting the `[?Hn]`
reference. The entry moves to **Settled** with one line on what was decided, so a question does not
get re-opened by someone who was not there.

## Settled

| Was | Decided | When |
|---|---|---|
| — | | |

---

## Future — what this product might also do

Domain ideas deliberately not in this release: things the product could *be*, not ways it could
look. Each is a sentence, not a design. UX ideas go in
[implementation-spec.md](implementation-spec.md); *"decided, but not now"* goes to
[implementation-tracking.md](implementation-tracking.md)'s **Parked**.

The distinction is what stops this section becoming a wishlist: here is *not decided yet*, Parked
is *decided against, for now*.
