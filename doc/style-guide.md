# {Project} — Style guide

**Owns.** What the product looks like: tokens, type, components and their states.

**Not here.** How a surface behaves ([implementation-spec.md](implementation-spec.md)) · what the
product does ([domain-spec.md](domain-spec.md)) · how the code is shaped
([design-guide.md](design-guide.md)) · which technologies render it
([tech-spec.md](tech-spec.md)).

**Rule of thumb.** If changing it would change how something *looks*, it belongs here. If it would
change what happens when you tap it, it belongs in implementation-spec.

**Write it when there is a first thing to look at, not before.** A palette chosen before any screen
exists is chosen in the abstract, and gets replaced the first time real content meets it. This
document is deliberately scaffolding — every project's visual vocabulary differs, so what follows is
a checklist of what to decide rather than an answer.

**A project with no visual surface deletes this file** and the reference to it in `README.md`.

---

## Tokens

Every value used more than once, named once. A hex code appearing in two places is a bug waiting for
someone to change one of them.

| Token | Value | Used for |
|---|---|---|
| | | |

Include the ones that are easy to forget: focus ring, disabled foreground, the shadow used for
raised surfaces, and whatever colour means *unknown* or *no data* — that last is not the same as
empty, and the two must be visually distinguishable.

## Type

| Role | Size | Weight | Line height |
|---|---|---|---|
| | | | |

State the smallest size that appears anywhere, and whether it survives the smallest supported
viewport in real light. Both real projects found a size that was fine on a desk and unreadable where
the thing was actually used.

## Components

One block per component. For each, name every state rather than only the default — the states are
where the work is.

### {Component}

| State | Treatment |
|---|---|
| Default | |
| Hover | |
| Active / pressed | |
| Focused | |
| Disabled | |
| Loading | |
| Error | |

**Touch:** minimum target size, and what happens where a hover-only affordance would otherwise be
the only route to something. A touch device has no hover, so anything hover reveals must be
reachable another way.

## States that are easy to forget

Decide these once, here, rather than per screen — they are what separates a design from a mock-up:

- **Empty** — before there is any data, distinct from loading.
- **Loading** — and whether it is a spinner, a skeleton, or nothing at all under some threshold.
- **Error** — what the reader can *do*, not a status word.
- **Unknown** — genuinely not known, distinct from empty or zero.
- **Too long** — the longest realistic string, not the tidiest one. Names, identifiers and
  user-entered text all overflow eventually.
- **The smallest supported viewport**, in the conditions the product is actually used in.

## Density and spacing

The spacing scale, and where it tightens. Say what governs the choice — a phone held outdoors and a
desktop dashboard want opposite answers.

## Motion

Durations, easing, and — more usefully — **what is not animated**, and the reduced-motion
behaviour.

## Accessibility floor

The minimum this project holds itself to: contrast ratio, focus visibility, target size, and whether
colour is ever the only carrier of meaning. Written as a floor rather than an aspiration, so it can
be checked.

## Preview page

A dev-only page rendering every token, component and state from the real code, gated per
[design-guide.md](design-guide.md). It is the only way to see the whole vocabulary at once, and the
fastest way to notice that two things which should match do not.
