---
name: build-stage
description: Build the signed-off goal sitting in Now — branch, write the specification, stop for review, implement one commit per checklist item, verify, and push. Refuses to tick a checklist item until a promotion target is named. Use after /plan-goal, or to resume a goal already in progress.
---

# Build stage

Builds the goal in **Now**. Rationale lives in `doc/workflow.md`; what follows is the procedure.

## First: check there is a goal to build

Read **Now** in `doc/implementation-tracking.md`.

- **Empty** — stop. Say so, and offer `/plan-goal`.
- **Present but not signed off** — stop. The sign-off is the gate; building without it is what the
  gate exists to prevent.
- **Present, signed off, items remaining** — proceed from the first unticked item.
- **Present, signed off, every item ticked** — the work is done and the goal is waiting to land.
  Skip to step 7. If the branch is not merged yet, say so and stop there; landing follows the merge,
  and merging is not yours to do.

## 1. Branch

Create `goal/{slug}` off `main`. One feature branch per goal, and **never commit a goal straight to
`main`** — including small corrective work, which is the kind that slips through.

**Git is performed, not narrated** — create it, do not describe how to. This is a standing
preference, recorded in `workflow.md`.

## 2. Specify, then stop

Write the `implementation-spec.md` **surface** sections the goal needs — it is organised by journey
and surface, so a goal usually touches several rather than one. Assign `IS-n.n` identifiers as you
write. Fold in whatever input was given at the planning gate; it is recorded in the goal.

Journeys are not written here. If the goal changes what someone is *trying to do* rather than how a
surface behaves, that is `/story-map`, and it should have surfaced at planning.

**Then stop and wait for explicit sign-off before writing implementation code.**

This is the second gate. Because input was collected at the first one, this should be a short
review rather than a rewrite; if it is regularly a rewrite, say so — the first gate is not doing
its job. Honour a per-goal opt-out if the user gives one, noting genuine open design questions in
the specification text itself and picking a sensible default for each rather than blocking.

## 3. Implement, one commit per checklist item

Commit each item separately as it lands. Messages say **why** — the what is in the diff. Decisions,
rejected alternatives, and anything surprising earn their lines.

Every new module opens with a comment naming the identifier it implements and the constraint it is
under. Tests cite the identifier in their names, so `spec:coverage` can see them.

## 4. Promotion is required before a tick

**Do not check an item off until a promotion target is named.** Ask, per item:

> What did this teach, and which document owns it?

| What it taught | Where it goes |
|---|---|
| a product rule is different than written | `domain-spec.md` |
| a behaviour ended up different than specified | `implementation-spec.md` |
| a technical choice, or a risk now accepted | `tech-spec.md` |
| a machine behaves in a way that surprises | `environment.md` |
| a convention proved itself | `design-guide.md` |
| why this specific change was made | the commit message |
| real work found, not to be done now | **Parked**, with what would unpark it |

**"Nothing to promote" is an available answer and frequently the right one** — plenty of items
teach nothing. But it must be *given*, not arrived at by nobody asking.

Make the promotion edit, then tick, and let the checklist line be one line: what was done, and
where the knowledge went.

```
- [x] Rules deploy on merge, Firestore only → environment.md §Firebase deploy credentials
```

An unpromoted lesson is a lost one, because this text is deleted when the goal lands.

## 5. Verify before claiming done

Run the **full** suite, not only what you touched. Report failures plainly with their output; a
skipped step is said out loud, never quietly dropped.

**Look at anything visual.** A passing test says the code ran, not that the result is right.

**Write throwaway verification for anything you are reasoning about rather than observing** — a
scratch script running the real functions and printing what actually happened. Delete it in the
same session. Two traps that have cost real time:

- Do not write scratch output where the dev server watches it; the page reloads mid-run and the
  failure reads as an application bug rather than a tooling one.
- A test failing after a deliberate rule change may be asserting the old behaviour. Decide which of
  the two is right before "fixing" either.

Then answer the goal's **Try it** line by actually doing it.

## 6. Push, and hand over for review

Push the branch, say plainly what to look at, and **stop there**.

**Never merge on your own judgement.** When the reviewer has read the diff and tells you to merge,
merge: then push `main`, and delete the branch locally and on the remote. The gate is the review,
not the typing — handing a command list back to someone who has already decided is friction, not
rigour.

## 7. Land the goal

Landing is a file change like any other, so it gets its own branch — `goal/land-{slug}` — never a
commit straight to `main`.

1. Delete the goal's text from **Now**.
2. Add a row to **Done**: the goal, the date, and **which documents received its knowledge**.
3. **Check nothing was lost.** Re-read what you deleted. If anything in it is not now somewhere
   durable, promotion was not finished — fix that before the deletion stands. This is the moment
   the deletion rule is actually tested.
4. Push and hand over for review, as in step 6.
5. Once merged, offer `/plan-goal` for the next goal, or `/sanity-check` if several have landed
   since the last audit.
