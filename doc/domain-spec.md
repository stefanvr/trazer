# Trazer — Domain specification

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

## 1. The run

A **game** is not a **run**. A run is three lives and one attempt at the map; a game is the whole
progression and may contain many runs. In Arcade they coincide; in Journey they do not. Every rule
below depends on which of the two it is talking about.

**FLOW**

`Game created` → `Mode selected` → `Run started` → `Level started`
`Level started` → `Level cleared` | `Run ended`
`Level cleared` → `Level chosen`\* → `Level started`
`Run ended` → `Game ended` (Arcade) | `Run started` (Journey)
`End level started` → `End level cleared` → `Game finished`
`Game aborted` — available from any state (**DS-1.13**)

**COMMAND — Create game**
*Actor:* player. *Requires:* nothing. *Emits:* `Game created`.

**COMMAND — Select mode**
*Actor:* player, once per game. *Requires:* the game has no mode yet (**DS-1.2**).
*Emits:* `Mode selected`.

**COMMAND — Choose level**
*Actor:* player, while navigating. *Requires:* the target is connected to the current position
(**DS-1.7**). *Emits:* `Level chosen`. Moving is not playing — this is a step across the map, and it
succeeds onto cleared, uncleared and locked nodes alike.

**COMMAND — Start level**
*Actor:* player, by entering the node they have moved to. *Requires:* the level is open for play
(**DS-1.8**). *Emits:* `Level started`.

**COMMAND — Abort game**
*Actor:* player. *Requires:* nothing (**DS-1.13**). *Emits:* `Game aborted`.

**POLICY**
When `Run ended` **and** the mode is Arcade → `Game ended`. The run was the game (**DS-1.4**).

**POLICY**
When `Run ended` **and** the mode is Journey → the player returns to navigation and may start a new
run. The game continues (**DS-1.5**).

**POLICY**
When the end-level condition for the mode becomes true (**DS-1.10**, **DS-1.11**) → `End level
started`.

**POLICY**
When `End level cleared` → `Game finished`. This is the only way a game ends in success, in either
mode (**DS-1.12**).

**REFERENCE — modes**

| | Arcade | Journey |
|---|---|---|
| Unlocked at game creation | the start level only | every level cleared in any previous game, and their neighbours |
| Clears persist between runs | no | yes |
| A run ending | ends the game | ends the run only |
| Reaching the end level | clear one designated route within a single run | clear every level on the map, accumulated across runs |

**RULES**

- **[DS-1.1]** A run grants three lives. Lives belong to the run and are never persisted — not
  between runs, not between games, in either mode. The run ends when the last one is spent. [?H1]
- **[DS-1.2]** A game has exactly one mode, chosen once at creation and never changed. The two modes
  differ in what persists and in how the end level is reached, so a game that switched mode
  mid-flight would have no coherent answer to either.
- **[DS-1.3]** Clearing a level is permanent in Journey and lasts only for the run in Arcade. This
  single difference is what makes Journey a progression and Arcade an attempt.
- **[DS-1.4]** In Arcade a game holds exactly one run. When the run ends the game ends, and the
  player starts a new game rather than a new run.
- **[DS-1.5]** In Journey a run ending returns the player to navigation with the map as they left
  it, and a new run may be started from anywhere then open. Dying costs the run, never the progress.
- **[DS-1.6]** A run always begins on a level that is open for play, and that level starts
  immediately. Navigation happens *between* levels, not before the first one.
- **[DS-1.7]** Navigation moves one connection at a time, in any direction, including back across
  ground already covered. There is no limit on how long a player may navigate before committing.
- **[DS-1.8]** A level is **open for play** when it is unlocked and has not been cleared *in the
  current run*. The run scope is the point: a level cleared in an earlier Journey run is open again,
  and one cleared five minutes ago in this run is not. Walking back over it is passage, not a replay.
- **[DS-1.9]** In Journey, the unlocked set is every cleared level together with every level directly
  connected to a cleared one. It is computed, never recorded — see the derivation below.
- **[DS-1.10]** In Arcade the end level is reached by clearing one **designated route** within a
  single run. The map carries more than one such route, so the flawless path is a choice rather than
  a fixed sequence. [?H2]
- **[DS-1.11]** In Journey the end level is reached when every level on the map has been cleared,
  accumulated across as many runs as it takes. Journey therefore rewards persistence where Arcade
  rewards a clean run — the two modes are different games over one map, not difficulty settings.
- **[DS-1.12]** A game ends in success only by clearing the end level. Every other ending — lives
  spent in Arcade, or an abort in either mode — ends it without success.
- **[DS-1.13]** A game may be aborted at any time, from any state, including mid-level. [?H3]

**DERIVATION — the unlocked set (Journey)**
*Inputs:* the set of cleared levels, and the map's connections.
*Output:* the set of levels the player may enter.
*Rule:* every cleared level, plus every level directly connected to one.
*Precedence:* none — the two contributions are unioned, and a level qualifying both ways is
unlocked once.
*No event.* Nothing happens when the set is recomputed; it is a function of facts already recorded,
and asking twice must always give the same answer. **[DS-1.9]**

Naming this a derivation rather than a `Level unlocked` event is deliberate. An unlock event would
be a ceremonial sticky by the document's own test — nothing subscribes to it, and it carries no
information that `Level cleared` and the map do not already carry between them.

**DERIVATION — whether the end level is available**
*Inputs:* mode, the cleared set, and — in Arcade — which levels were cleared *in this run*.
*Output:* available, or not.
*Precedence:* mode decides which question is asked; the two conditions never both apply
(**DS-1.10**, **DS-1.11**).
*No event.* Checked from recorded facts, not raised.

**READ — what the player needs to navigate**
*Asked by:* the player, at every step across the map.
*Needs to show:* current position; for each connected level whether it is cleared, open for play, or
locked; lives left in the run; and whether the end level is now available.

Without the cleared-versus-open distinction the player cannot tell passage from a playable move,
which is the one judgement navigation asks of them.

---

## Open items

The unresolved arguments — event storming's hotspots. **One list for the whole document**, so the
review queue is visible in one place; areas above point at it with `[?Hn]` rather than restating.

Each says what is currently true, what the alternative is, and what would settle it. Keeping them
here rather than in someone's head is what stops them being silently re-decided by whoever touches
that code next.

- **[H1]** **What a lost life does to the level being played.** `Run ended` is well defined — the
  last life spent — but a life lost with lives remaining is not. Currently the specification says
  only that the run continues. The alternatives are that the level restarts from its opening state,
  or that the player is returned to navigation with the level left uncleared and therefore still open
  for play (**DS-1.8**). The second reading follows from the timeline this area was built from, where
  *level cleared or player died* both led to level options being presented — but that timeline used
  *died* for the run ending, so it is not evidence for the intermediate case. Settled by deciding
  what a life is for: a retry of the level, or a budget for the whole run.

- **[H2]** **What makes a route in Arcade a designated one.** **DS-1.10** says the map carries more
  than one designated route to the end level, but not who designates them or what distinguishes a
  designated route from any other path through the map. The alternatives are that routes are authored
  explicitly as part of the map data, or that a designated route is any path satisfying some property
  — reaching a particular depth, or ending at a node with no further connections. The first is
  checkable by the level data; the second is checkable by the map's shape. Settled when the map
  format is decided.

- **[H3]** **Whether aborting preserves Journey progress.** **DS-1.13** allows an abort from any
  state, including mid-level, and **DS-1.12** puts it among the endings without success. What it does
  to the cleared set is unstated. The alternatives are that clears already earned survive the abort —
  consistent with **DS-1.5**, where dying costs the run and never the progress — or that abandoning
  forfeits the game entirely. The first makes abort a graceful exit; the second makes it a penalty.
  Settled by whether abort is meant as *stop playing* or as *give up*.

- **[H4]** **Score has not been storm-ed at all.** The frozen draft describes points per brick type,
  a clear-speed bonus and a multiplier while Fast is active, and the run area above mentions none of
  it. Whether score belongs to the run, the game, or persists as a high-score table across games is
  undecided, and it interacts with **DS-1.3**: if Journey clears persist, it is not obvious whether
  the score for a re-cleared level counts again. Settled by a session on scoring, which should follow
  the arena area rather than precede it.

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
