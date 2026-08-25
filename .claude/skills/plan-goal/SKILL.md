---
name: plan-goal
description: Take one goal from the backlog through discussion, open questions, proposal and sign-off, then move it into Now. Use when Now is empty and the next piece of work needs agreeing before anything is built. Holds the WIP limit and asks for specification input at the sign-off gate.
---

# Plan goal

Moves one goal from **Backlog** to **Now** in `doc/implementation-tracking.md`. Rationale for any
of this lives in `doc/workflow.md`; what follows is the procedure.

## First: hold the WIP limit

Read **Now**. If a goal is there, **stop and say which one** — and say the right thing about it,
because two states look identical at a glance and need opposite answers:

| State of the goal in Now | What to say |
|---|---|
| **Unticked items remain** — in progress | Finishing it comes first. Offer `/build-stage` to continue it. |
| **Every item ticked** — done, not landed | The work is finished; it needs merging and then landing. Offer `/build-stage`, whose step 7 deletes the goal text and writes the **Done** row. |

**Always name the next command.** Refusing without naming a way out is worse than not refusing:
`/plan-goal` declines because Now is occupied, `/build-stage` declines on an empty Now, and the
user is caught between two skills each correctly saying no.

Do not plan alongside the goal in Now.

Override is the user's to give explicitly. If they do, note in the tracking document that two goals
are open and which was the interruption — an unrecorded second goal is how a WIP limit stops being
real.

## Choosing the goal

Recommend one from **Backlog** and say why in a sentence. Good reasons, in rough order:

- it is the thinnest slice that still reaches end to end;
- it unblocks the most of what is behind it;
- it is where the design is least certain, and building it will settle an open item.

**Not** because it is the easiest. The easy goal is easy because it is already understood.

Check **Parked** before proposing anything new — the reason something was parked may have expired,
and unparking is cheaper than planning from scratch.

## The four movements

Write each into the **Planning** section as you go, so the record exists before the conversation
is over rather than being reconstructed after it.

**Scale the movements to the goal.** A correction, or a defect found between goals, often arrives
already decided. Then movements 1 and 2 are a sentence each — *"no open questions, both defects were
found and decided in the same message"* — and the whole thing is one message. Do not manufacture a
discussion to fill the shape; a gate costing more than the work it guards is one that gets skipped
later, when it matters.

### 1. Discussion

What this is really for, what it depends on, what it unlocks. Name what already exists that this
should reuse rather than repeat — that is the DRY check, and it is much cheaper here than in
review. Say which domain areas it touches.

### 2. Open questions

The things that genuinely need the user's input, asked specifically.

**A question you can answer by reading the repository is not a question for the user.** Read it
first. Asking what is already written is how a planning conversation becomes tedious, and tedium is
what makes the gate get skipped later.

The bar: **answerable in a sentence.** *"The domain spec leaves `rustperiode` unresolved — show
unknown, or seed from general knowledge and mark it `seeded`?"* is a good question. *"How should
the season view work?"* is a design session wearing a question mark, and it was not ready to be
asked.

Ask them one at a time where the answers depend on each other, together where they do not. If an
answer opens a real fork, follow it rather than continuing down the list.

Anything that turns out to be an unresolved domain argument goes to `domain-spec.md`'s **Open
items** as `[Hn]`, not into this conversation.

### 3. Proposal

Three things:

- **Checklist** — the steps, each one commit's worth of work. If an item cannot be committed on its
  own, it is two items.
- **Try it** — how the goal is exercised once done, concretely. *"The code is there"* is a failed
  answer. **If you cannot write this line, the goal depends on something that does not exist yet** —
  say so now, which costs a sentence, rather than discovering it mid-build.
- **Covers** — the `DS-` and `IS-` identifiers this goal implements. This is what later makes the
  release gap and coverage report mean something. A toolchain or process goal implements no rule, so
  **Covers** is legitimately empty: say so plainly rather than inventing an identifier to fill it.

**Check the checklist does not count one thing several times.** The test is not *are these
different files* — it is **can these be committed separately**. If two items must land in the same
commit, they are one item, and listing them apart leaves the plan looking more right than it was.

Stating this in terms of files was not enough, and it failed twice. First a skill, its git steps and
the document it writes were listed separately, and writing the skill once delivered all three. Then
three behaviours of a single tool were listed apart, written in one pass, and produced one commit
for three ticks.

### 4. Sign-off, and spec input

Ask for the sign-off explicitly, and in the same breath ask the question that matters most:

> **Any input for the specification, give it now.**

Not politeness. Where input arrives before the specification is written, it is right first time;
where it does not, it needs correcting afterwards. Record what comes back **in the proposal**, so
`/build-stage` writes the specification with it rather than rediscovering it.

Nothing moves to **Now** without an explicit sign-off.

## On sign-off

1. Move the goal into **Now**, checklist, **Try it** and **Covers** intact, with the sign-off date
   and a line on what input was given.
2. Leave **Planning** empty. Goals are planned one at a time, when they are about to be built.
3. Remove the item from **Backlog**.
4. Say that `/build-stage` is next.

Do not start building. That is the other skill, and the separation is what keeps the gate real.
