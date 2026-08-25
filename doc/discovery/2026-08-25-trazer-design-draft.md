# The Trazer design draft, read closely

> **Input artifact, frozen 2026-08-25.** Not maintained. Where this disagrees with the specifications,
> they are right. Kept for the reasoning, not the rules.

**Source:** `~/trazer-artifacts/trazer.md` (198 lines, *TRAZER — Game Design Spec*) and
`~/trazer-artifacts/style-guide.md` (91 lines, *TRAZER — Style Specification*). Both pre-date this
repository and were written outside any process.
**Prompted by:** starting the project. These are the only existing Trazer material, and nothing had
been specified yet. Read before `/event-storm` so that the domain is derived from something rather
than invented in an interview.

---

## 1. What kind of source this is

**Finding: the source is written as a specification, but nothing in it is derived.** It states
outcomes with no evidence, no rejected alternatives, and no record of why any number was chosen.

Evidence — the draft's own voice throughout: *"Bat count is level-defined, capped at 6"*,
*"Default length: 3 cells"*, *"16–20 levels"*. Each is a decision presented as a fact. The one place
it explains itself is the bat cap — *"Six is a playability ceiling: beyond that, a single player
can't meaningfully track independently moving bats in real time"* — and that single clause is the
only reasoning in 198 lines.

This matters because it is exactly the failure `doc/discovery/README.md` exists to prevent, arriving
from the outside. Copying this material into `domain-spec.md` unchanged would produce a specification
whose rules cannot be questioned, because no one can reconstruct what they were weighed against.

**The author's own framing, given at the start of this session:** the material is *a draft to be
challenged*. Nothing in it is settled by having been written down. That single answer converts most
of what follows from *defects* into *open questions*, and it is the most useful thing recorded here.

**What must be true for this to be worth building** — asked directly, answered as **two** things,
not one: the multi-bat shared-control mechanic (§2) and the choose-your-next-level node map (§6).
Style and faithfulness to the 1988 original were both explicitly *not* chosen. Every contradiction
below is ranked by whether it touches those two.

---

## 2. Settled during this session

Three questions were put to the author while reading. The answers are evidence of intent, not rules —
they are recorded here so `/event-storm` can confirm them rather than rediscover them.

### 2.1 A bat pairs with a hazard *run*, not an edge — load-bearing

The draft contradicts itself on the bat ceiling. §2 says *"one or more edges are fully lined with
hazard blocks, each guarded by a single bat"* and *"capped at 6"*. An arena has four edges, and §9
lists interior hazard blocks with dedicated bats as a **future** idea. Six is therefore unreachable:
one bat per edge tops out at four.

**Resolved in session:** the pairing is bat-to-hazard-run. One edge may carry two hazard runs, each
with its own bat and track. Six becomes reachable on four edges.

The consequence is more interesting than the fix. Control is shared by orientation — *"a single
left/right input moves every horizontal bat together"* — so **two bats on the same edge move in
lockstep**, hitting their own track limits at different moments. That is a real mechanic falling out
of two rules that were written separately, and neither section mentions it.

### 2.2 Capsule scope is per-bat for size, global for behaviour — revises the source

§5 classes Expand, Shrink, Catch and Laser alike as **per-bat**. That creates a collision the draft
denies: §3 justifies one shared action input on the grounds that each use *"only ever applies to
whatever's currently ready to act"*, but with Bat A laser-armed and a ball stuck to Bat B, both are
ready — and §5 says the input fires *"every currently armed bat at once"* **and** releases *"every
currently stuck ball at once"*.

**The author's revision:** size effects (Expand, Shrink) stay per-bat; behavioural effects (Catch,
Laser) become **global to all bats**. A caught Laser arms every bat; a caught Catch makes every bat
sticky.

**What this fixes:** the *which bat* half. With no per-bat divergence in behaviour there is no
Bat-A-versus-Bat-B case, and §3's justification holds again for that reading.

**What it does not fix, and is left open:** the *which effect* half. Catching a Laser capsule and a
Catch capsule leaves every bat simultaneously armed and sticky, and one press still has two
meanings. Nothing in the source makes the two mutually exclusive. Recorded as an open question rather
than assumed away.

**Also newly consequential:** a global Laser means every bat fires at once, and bats have
orientations — so vertical bats fire horizontally and horizontal bats fire vertically. With six bats
that is six simultaneous bolts on two axes. The draft never contemplates this, because it was written
with Laser as a single-bat effect.

### 2.3 The win condition was never thought through — load-bearing

§6: *"clearing a node ends the game in a win when that leaves no unplayed next-node options
remaining — either because the node has no further connections, or because every one of its next
options was already cleared earlier in the same game via a different path (paths can converge)"*.

Combined with *"A level can only be played once per game"*, this fires early. On the suggested 4×5
map a player can clear four nodes, reach one whose successors were all already taken by a converging
path, and win — against a design that advertises *"16–20 levels"*.

**Asked directly, the answer was that this had not been noticed.** The condition was written for the
satisfying case. Recorded as an open question, with the options as they were put:

- a short path is a legitimate but poor win, and the win screen already shows *"score, levels
  cleared, path taken"*, so a thin win is visibly thin;
- premature dead ends are an **authoring defect**, and the map carries an invariant — no node may
  strand the player before some depth — which is the only option here that something could
  mechanically validate;
- running out of fresh options early is a **third outcome**, neither win nor game over, for which the
  draft has no screen.

---

## 3. Contradictions the source has not resolved

Ranked below the two load-bearing ones, but each is real and each has evidence.

**3.1 Two life-loss mechanisms, gated differently.** §3 says *"A life is lost only when the **last**
ball on screen touches a hazard block"* — the plural-ball case is explicitly handled. But the monster
generator's hazard ball *"costs a life on contact with a bat"* (§4) with no such qualifier. So with
three balls in play, a hazard block costs nothing and a monster ball costs a life. Whether losing a
life this way also removes a ball is unstated, which leaves *life* meaning two different things in
two paragraphs. §3's own wording — *"or an undefended monster-generator hazard ball reaches a bat"* —
uses *undefended* for a ball that has reached the very bat defending against it, which reads as
leftover phrasing from an earlier rule.

**3.2 Multiball's arithmetic does not close.** §3 caps concurrent balls at four; §5 says Multiball
*"splits the current ball into 3"*. From one ball that gives three. From three, *the current ball* is
ambiguous with three candidates, and any reading gives five against a cap of four. The two numbers
were written independently.

**3.3 The two documents disagree about reinforced bricks.** `trazer.md` §4 makes hit count a
per-brick property, *"v1 levels use 2-hit or 3-hit variants (visually cracks between hits), with the
property left open-ended so future levels can use higher hit counts"*. `style-guide.md` §3 defines
exactly two stages, `--brick-reinf-1` and `--brick-reinf-2`. A 3-hit brick has no third appearance,
and an open-ended hit count has no appearance at all beyond three. The domain document generalised;
the style document did not follow.

**3.4 Uniform bat length and speed is only true at level start.** §2: *"Length and speed are equal
across all bats by default"*, and §9 offers per-bat asymmetry as a future lever. But Expand and
Shrink are per-bat and confirmed so in §2.2 above — so lengths diverge the moment a capsule is
caught. The invariant is about authoring defaults, not about runtime, and the draft states it as
though it holds throughout.

---

## 4. Gaps — never addressed at all

Each of these is a question implementation will be forced to answer, so leaving them here means
answering them deliberately rather than in whichever module reaches them first.

- **What a laser bolt does to anything but a standard brick.** §5 says it destroys *"standard bricks
  in its path"*. Reinforced bricks, unbreakable blocks, hazard blocks, generators and refractors are
  all unmentioned. Whether a bolt stops, passes, or damages is undefined for five of the seven
  element types in §4.
- **Which way a capsule falls in an arena with bats on four edges.** Capsules *"drop"* and are caught
  by *"any bat"*, but a vertical bat on the left edge moving up and down has an unclear relationship
  to a downward-falling capsule. Gravity presupposes a bottom; this arena may not have one.
- **What a monster hazard ball does on touching a hazard block.** It *"bounces off bricks/walls/blocks
  like a normal ball"* and dies on a bat. Hazard blocks are the one element whose interaction is
  unstated, and hazard blocks line the edges the ball travels toward.
- **Whether a bat's track must cover the hazard run it defends.** §2 says a track is *"typically the
  length of the hazard blocks it defends"*. *Typically* leaves undefendable hazard as either a
  difficulty lever or an authoring mistake, with nothing able to tell them apart.
- **Seven of sixteen event cues have no motion primitive.** `style-guide.md` §5 claims *"No event in
  v1 is audio-only or visual-only"* and then maps nine event categories, while `trazer.md` §8 lists
  sixteen. Launch, laser fire, catch release, generator ejection, node choice, game over, win and
  pause are visually specified in §8 but absent from the primitive mapping.

---

## 5. Two observations worth carrying forward

**5.1 Speed belongs to the run, not to a ball.** §5 justifies Slow and Fast being global with
*"there's only one ball speed"*, and §3 ramps that speed on a level clock — *"increases in small
steps at a fixed interval ... resets to base at the start of every level"*. Four concurrent balls
therefore share one speed that is a function of elapsed level time, not of any ball.

This suggests speed is not a property of a ball entity at all, and that modelling it as one would put
the same value in up to four places and require them to agree. It also connects two systems the draft
keeps apart: pause *"freezes ... the level clock"* (§7) and score includes *"bonus for level clear
speed"*, so the same clock drives difficulty and reward.

**5.2 There are exactly two sources of randomness, and one is deliberate.** The glass refractor
applies *"a small random variance (a few degrees) ... on every pass, so the exact deflection isn't
perfectly predictable or repeatable even at the same placement"* (§4), and capsules drop on a
*"chance"* (§5). Everything else in the game is stated deterministically.

Unpredictability is the refractor's whole point, so this is not a defect. But it is the one thing
that makes the simulation untestable by replay, and `tech-spec.md` already commits the bulk of
coverage to fast deterministic tests over game logic. How randomness is supplied — and whether it can
be made repeatable under test without weakening it in play — is a decision the domain spec will leave
open and the tech spec will have to close.

---

## 6. Where this material belongs

The source mixes three kinds of decision that this repository keeps apart, so the routing is worth
recording before anything is copied anywhere.

| Source | Goes to | Note |
|---|---|---|
| `trazer.md` §1–§7 | `domain-spec.md` | Arena, bats, ball, bricks, capsules, progression, lives and scoring are rules that survive any interface |
| `trazer.md` §7 pause overlay, HUD button, `Escape` | `implementation-spec.md` | *That* the game pauses is domain; the button, the key and the overlay are surface |
| `trazer.md` §8 cue table | `implementation-spec.md` | Presentation of events, not the events themselves |
| `trazer.md` §9 | `domain-spec.md` **Future** | Things the product could be — except the level editor, which is a build decision and belongs in tracking's **Parked** |
| `style-guide.md` all | `style-guide.md` | Tokens, palettes and motion primitives, near-verbatim |

One caution for whoever does the copying: §8 is a table of *events* with their cues, and the event
column is domain vocabulary — `Ball hits reinforced brick (not destroyed)`, `Capsule caught`,
`Level cleared`. Those names should be reconciled with the event storm rather than invented twice.

---

## 7. Ready to become rules, and still arguments

**Ready** — asserted plainly, internally consistent, and untouched by anything above. These need
confirming in the event storm, not deciding:

- the arena and its four plain-bounce edges, with hazard blocks as the only thing that makes an edge
  dangerous (§1);
- bat orientation fixed for a level, movement on one axis, control shared by orientation (§2);
- the ball speed ramp, its reset per level, and the mirror-angle reflection with an edge-versus-centre
  nudge (§3);
- the seven element types and their behaviours, excepting the reinforced-brick staging in 3.3 (§4);
- three lives per game, never persisted, shared across the run (§7);
- Classic versus Journey, and that only cleared-node status persists (§6). This section is the most
  carefully reasoned in the draft — it anticipates the once-per-game objection and answers it
  explicitly, which nothing else in the source does.

**Still arguments** — carry into the event storm as open items:

- the early-win condition (2.3), which is load-bearing and undecided;
- one action input serving two simultaneously-active global effects (2.2);
- whether a monster-ball life loss also costs a ball, and whether it ignores the last-ball rule (3.1);
- Multiball's split-to-three against a cap of four (3.2);
- reinforced brick hit counts against two crack stages (3.3);
- all five gaps in §4 above, none of which has a stated position to argue against.

**Not carried forward at all:** faithfulness to the 1988 original. The draft opens by grounding
itself in TRAZ and then diverges freely — *"not a free-form 8×8 grid like TRAZ, a curated, smaller
branching structure"* — and when asked, the author ranked faithfulness below both load-bearing
mechanics. It is an origin, not a constraint.
