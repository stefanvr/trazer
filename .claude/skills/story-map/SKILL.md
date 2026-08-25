---
name: story-map
description: Derive the journeys through a product from its domain spec, write them into doc/implementation-spec.md, and slice them into outcome-shaped goals in the backlog. Use once enough of the domain exists to have journeys through it, or when a new area of the domain needs journeys and goals. Produces the backbone diagram, Part 1 journeys, and the tracking backlog.
---

# Story map

Produces three things that belong together: the **backbone diagram** and **Part 1 journeys** in
`doc/implementation-spec.md`, and the **goal backlog** in `doc/implementation-tracking.md`.

## Why it works differently from `/event-storm`

Event storming interviews, because the domain is only in the user's head. Here the raw material
already exists — commands have actors, read models say what someone needs to see, policies say
what follows what. **Propose a first pass from the domain spec, then walk it together.** The
material being proposed is already the user's own; the risk that made proposing wrong in the storm
does not apply.

Say plainly that you are proposing, and be concrete about what you inferred from where.

## Building the backbone

**Activities** are what someone is trying to get done, in the order they typically do it, left to
right. Derive candidates from the domain spec's commands grouped by actor and occasion — commands
one person issues in one sitting are usually one activity.

**Steps** sit under each activity: what they do, in order, within it.

Three tests for a good backbone, all of which catch real mistakes:

- **It reads as a sentence.** *Find something → take it out → get it back.* If reading the
  activities aloud does not describe someone's day, the grouping is by system rather than by
  person, which is the commonest way a story map turns back into a module list.
- **No activity is named after a screen.** *"The dashboard"* is not an activity. What is somebody
  doing there?
- **Every actor's journey is present.** An admin, an owner and a visitor have different backbones.
  A map with one is a map of the loudest user.

## Slicing into goals

A **slice** cuts horizontally across the whole backbone: the thinnest path that goes end to end.
Slice one is a walking skeleton — every activity represented, each at its crudest.

**A slice is never a layer.** *"Build all the data access"* is a layer and cannot be exercised;
*"a member can find one book and borrow it, with no reservations and no fines"* is a slice and can
be demonstrated to someone. This is the same sequencing rule the tracking document already
enforces through its **Try it** line, arriving from a different direction.

Each slice becomes one goal in **Backlog**, written as an outcome — what becomes true for someone,
not what gets built. Steps deliberately left out of this release go to **Parked** with what would
unpark them, and domain areas that no slice touches at all go to **Release gap**.

## Writing Part 1

Journeys are narrative prose, and the split from Part 2 is strict: **a journey says what someone
does; a surface says how it behaves.** No sentence appears in both.

- Name the surfaces the journey passes through in its subtitle. That naming is what an end-to-end
  test cites, and it is the only binding a journey has — journeys carry no `IS-` identifiers,
  because narrative gets reworded and identity on a volatile thing rots.
- Cite domain identifiers where the journey turns on a rule. *"Being blocked prevents collection,
  not reservation (**DS-2.1**)"*.
- Keep it short. A journey longer than a paragraph or two per activity is describing surfaces.

When you catch yourself explaining a control, stop: that sentence belongs in Part 2, and the
journey needs only the verb.

## The diagram

Small, and deliberately not exhaustive — it guides the prose rather than replacing it. A mermaid
`flowchart LR` with one subgraph per activity and its steps inside. Mermaid renders in GitHub and
in most editors' preview, so it stays in the document rather than becoming an image nobody
regenerates.

**Every step in the diagram appears as a journey step, and no journey step is missing from the
diagram.** `/sanity-check` reports both directions, so a diagram that has drifted is found rather
than believed.

## Surfaces are not written now

Part 2 sections are filled in **per goal**, when that goal reaches its specify step — not up
front. Create the section headings the journeys reference, each holding `_Not specified yet._`, so
the links resolve and the gaps are visible.

Writing all the surfaces now would be the same mistake as planning four goals ahead: specified by
someone who has not built the first one.

## Afterwards

Report which slice is proposed as first, and why that one — *"it is the only slice that touches
every activity"* is the usual answer and the right one. Offer `/plan-goal` on it.
