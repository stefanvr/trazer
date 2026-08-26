# Workflow

**Owns.** How work gets done: the goal loop, the review gates, branching and commit granularity,
and how documents stay true as work lands.

**Not here.** Anything about the product. If a statement would still hold on a completely
different project, it belongs here; if it would change, it belongs in one of the specifications.

> **Integration branch:** `main`. One feature branch per goal, named `goal/{slug}`, merged back
> after review.
>
> **A long-running integration branch is deliberately rejected, not merely unused.** The project
> this flow was learned on ran a `build-vN` branch that reached `main` only at milestones, and it
> was kept for historic reasons rather than chosen. The side effects were not chosen either:
> `main` stopped being the thing under discussion, merges arrived in batches too large to review
> as one change, and the branch outlived the reason it existed. A goal is already the unit of
> review, so a second layer of long-lived branching buys nothing and costs that.

---

## Work is goals, not tasks

A **goal** states an outcome — what becomes true for someone once it lands. Not a list of things
to build; the list is how you get there and is thrown away afterwards.

> **Goal:** the owner can stand in the garden, pick a border, tap a clump, and see what is known
> about that specific planting.

versus what a task list would have said — *render SVG layout, add hit-testing, build detail
panel*. The second is not wrong, it just cannot tell you whether it is finished, or whether it was
worth doing.

Goals live in [implementation-tracking.md](implementation-tracking.md) in four states, plus one
siding:

**Backlog** → **Planning** → **Now** → **Done**, and **Parked** off to the side.

**The WIP limit is one goal in Now.** Not a guideline. A second goal in progress means neither is
being finished, and the first thing lost is the honesty of the tracking document.

Overriding it is the reviewer's to do, explicitly — and the override is **recorded**: which goal
was interrupted, and by what. An unrecorded second goal is how a WIP limit stops being real, since
by the following week nobody can tell an exception from the normal state.

---

## Per goal

### 1. Plan it — `/plan-goal`

A goal leaves Backlog by being talked through, in four movements. This is the most valuable half
hour in the loop and the cheapest place to be wrong.

1. **Discussion.** What is this really for, what does it depend on, what does it unlock. What
   almost-identical thing already exists that this should reuse rather than repeat.
2. **Open questions.** The things that genuinely need *your* input, asked specifically. Not "how
   should this work" but "the domain spec leaves `rustperiode` unresolved — do we show unknown, or
   seed from general knowledge and mark it `seeded`?" A question you can answer in a word is a
   good question; one that requires a design session was not ready to be asked.
3. **Proposal.** The checklist, the **Try it** line, and which `DS-`/`IS-` rules the goal covers.
4. **Sign-off — and spec input now.** Explicit; nothing moves to **Now** without it. The sign-off
   asks one further thing directly: **any input for the specification, give it now.**

   That question is not politeness, it is the lesson of the previous build. Where input arrived
   before the specification was written, the specification was right first time; where it did not,
   it needed correcting afterwards. Asking at this gate is what turns the next gate into a review
   rather than a rewrite — and it is what the old *"spec it and start"* opt-out was really
   reaching for.

**Not every goal needs all four movements at length.** A correction, or a defect found between
goals, often arrives already decided — there is nothing to discuss and nothing to ask. Say so, write
the checklist, take the sign-off in the same message, and move on. The movements are a checklist of
what has to be *covered*, not a required length, and a gate that costs more than the work it guards
is a gate that gets skipped for real work later.

What does not collapse is the record: the goal still gets its outcome, its **Try it** and its
promotion on the way out. Small is not the same as untracked.

**Answer the Try it line during planning, not after.** It is the sequencing rule's only real
enforcement: a goal you cannot describe exercising depends on something that does not exist yet,
and finding that out costs a sentence now instead of a rewrite later. "The code is there" is a
failed answer.

**Plan the goal you are about to build, not the four after it.** A plan written four goals early
was written by someone who had not built the first four.

### 2. Branch

One feature branch per goal, `goal/{slug}`, off `main`. Keeps the goal reviewable as a unit, and
reverting it a single operation.

**Never commit a goal straight to `main`** — including small corrective work, which is exactly the
kind that slips through because branching for it feels disproportionate. The branch is what makes
review possible at all; work already on `main` can only be reviewed after the fact.

### 3. Specify, then stop

Write the [implementation-spec.md](implementation-spec.md) surface sections the goal needs — it is
organized by journey and surface, not by goal, so a goal typically touches several sections.

**Then stop and wait for explicit sign-off before writing implementation code.** The cheapest
review gate in the loop: a wrong assumption costs a paragraph here and a day of rework once the
code exists.

**Two gates, and why the second survives.** This is the second — the goal itself was signed off at
planning. It stays because the two catch different things: the first catches *building the wrong
thing*, the second catches *building the right thing wrongly*. With the input question now asked at
the first gate, this one is reviewing a specification written *with* that input, so it should be
short. If it is regularly a rewrite rather than a review, the first gate is not doing its job and
that is the thing to fix.

**Opt-out.** When the reviewer explicitly says to skip the wait for a given goal — *"if there are
no significant questions, spec it and start, I'll review after"* — then note any genuine open
design question *in the specification text itself*, pick the sensible default for each rather than
blocking, and proceed. Review happens against the finished result instead. Per-request, not a
change to the default.

### 4. Implement, one commit per checklist step

A separate commit per item, not one per goal. Bundling makes the diff unreviewable and bisecting
useless. Commit messages say **why** — the what is in the diff. Decisions, rejected alternatives,
and anything surprising are worth the lines.

**Two items that cannot both be reached are one item.** The planning test — *can these be committed
separately* — is about more than whether the code compiles apart. A screen only arrived at through
another screen cannot land on its own in any state worth committing: the first commit leaves the
application rendering nothing, and no reviewer can exercise it.

Found building the walking skeleton, where *the map screen* and *the stub level* were planned as
separate items. The map is reachable only by clearing a level, and clearing a level is what the
other item builds. Either commit alone would have been a broken application, so they were merged
during the build and the merge recorded on the checklist line.

When it happens, merge the items and say so on the checklist rather than committing a half-working
state to preserve a plan — the plan was wrong, and the tick should record what was actually done.
**Ask it at planning time as a question about reachability**, not about files: *after this item and
before the next, what can someone actually do?*

### 5. Verify before claiming done

Run the **full** suite, not just what you touched. Report failures plainly, with output; a skipped
step is said out loud, not quietly dropped.

**Look at anything visual.** A passing test says the code ran, not that the result is right. A
colour at 18% opacity over dark terrain draws correctly and is effectively invisible — only
looking found that.

**Write throwaway verification for anything you are reasoning about rather than observing.** A
scratch script that runs the real functions and prints what actually happened — a seeded
simulation over many iterations, a screenshot, a direct check of a computed value — repeatedly
catches what careful thinking misses: off-by-one errors in hand-worked coordinates, a rule that
never fires, a fixture that is not what you meant. Delete it in the same session.

**And when the scratch script reports a failure, suspect the script first.** One here reported a
deploy mismatch that did not exist: it looked for an identifier in its formatted form, which is
assembled at runtime, while the bundle stores the two halves separately. Reading the actual bytes
settled it in seconds. A verification tool is code too — written quickly, without tests of its own,
by someone who already believes they know the answer.

Two traps, both of which have cost real time:

- **Do not write scratch output where the dev server watches it.** A live-reloading server reloads
  the page mid-run and resets the state you were inspecting, and the failure reads as an
  application bug rather than a tooling one.
- **A test failing after a deliberate rule change may be asserting the old behaviour.** Before
  "fixing" anything, decide which of the two is right. A test written when the old rule held is
  evidence about the old rule — but it is equally possible the rule change was wrong and the test
  is saying so. Read it before touching either.

### 6. Push, review, merge

Push the branch as soon as the goal is complete — **before** review and before any merge. The work
is off your machine from that moment, and the reviewer has something to look at that is not your
working copy.

Nothing merges before review. Then merge into the integration branch and push that; because the
branch was already pushed, its history survives on the remote independently rather than only
implicitly inside the integration branch. Delete the branch once merged and confirmed.

### Git is performed, not narrated

**Standing preference.** `/build-stage` runs the git operations itself — creating the branch,
committing per checklist item, pushing before review, and **merging once told to**. Recorded here
rather than agreed again at the start of every goal.

**The gate is the review, not the typing.** A merge never happens on the skill's own judgement; it
happens on an explicit instruction, after the reviewer has read the diff. That is what keeps the
gate real. Refusing to merge *after* being told to adds no safety — it hands a command list back to
someone who has already made the decision, which is friction wearing the costume of rigour.

**Landing a goal is itself a file change**, so it happens on its own branch like any other work,
and is reviewed like any other work. It is not a tidy-up commit on `main`.

---

## Promote before you tick

**This is the rule the tracking document depends on.** A goal's text is deleted when it lands, so
anything learned along the way must already be somewhere else.

Before checking an item off, ask what it taught, and put that where it belongs:

| What you learned | Where it goes |
|---|---|
| A rule of the product is different than written | `domain-spec.md` — fix the rule, same change as the code |
| A behaviour ended up different than specified | `implementation-spec.md` — it describes the end state |
| A technical choice, or a risk now accepted | `tech-spec.md` |
| A machine behaves in a way that surprises | `environment.md` |
| A convention proved itself | `design-guide.md` |
| Why this specific change was made | the commit message |
| Real work found, but not to be done now | **Parked**, with what would unpark it |

Then the checklist line is one line — what was done, and where the knowledge went:

```
- [x] Rules deploy on merge, Firestore only → environment.md §Firebase deploy credentials
```

Compare that with carrying ten lines of narrative in the tracking document, where it is read once
and then scrolled past forever. **The test is mechanical: delete the goal's text. If something is
now missing, promotion was not finished.**

**`/build-stage` will not tick an item until a promotion target is named.** *Nothing to promote* is
an available answer and frequently the correct one — plenty of items teach nothing — but it has to
be **given**, not arrived at by nobody asking. Prompting was the alternative, and a prompt is
precisely what gets waved through on item nine of nine, which is the item most likely to have
taught something.

## Work found mid-goal

Something real found while building, which belongs to the goal in progress, is added to its
checklist as an **`Ad hoc:`** item and then treated like any other: promoted, then ticked. Not
folded silently into a neighbouring item, and not left out because the plan failed to predict it.
A checklist of clean ticks records a plan, not a build.

Anything found that does **not** belong to this goal goes to **Backlog** or **Parked** instead.
Adding it here is how a WIP limit of one quietly becomes a limit of one-plus-whatever-turned-up.

## Defer honestly

Work found but not to be done now goes to **Parked** with three things: what is wrong, why it was
not fixed then, and what fixing it would take. *"Not a minor tweak"* is useful; *"improve X"* is
not. Anything parked because it needs a **decision** rather than work says which decision, and
what the options are. That is what makes it resumable by someone else.

Parked is a siding, not a bin. `/sanity-check` reads it.

## When a rule turns out to be wrong

Specifications get things wrong. When implementation shows a documented rule does not hold:

1. Fix the document that owns the rule, in the same change as the code.
2. Say plainly in the commit message that it is a reversal, and why the original reasoning failed.

Do not leave a document asserting something the code no longer does. A specification nobody trusts
is worse than none, because people keep half-believing it.

Watch specifically for **implementation limitations leaking into rules** — *"it works this way
because that was awkward to build"* is a bug in the document, not a design decision. This has
happened before: a transfer was specified as free because neither container tracked an action
budget, which is a limitation dictating a rule rather than the reverse. Write the rule the domain
actually wants, then record the gap if the implementation cannot meet it yet.
