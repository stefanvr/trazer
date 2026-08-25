---
name: event-storm
description: Build or extend doc/domain-spec.md by running an event storming interview, one domain area at a time. Use when working out what the product actually is — its events, commands, policies and rules — or when a new area needs adding to an existing domain spec. Interview style, one question at a time, with the user answering as the domain expert.
---

# Event storm

Builds `doc/domain-spec.md` **one area per session**, by interview.

## Two rules that govern everything else

**One question at a time.** Ask, wait, listen, ask the next. Batched questions get one answer
covering two of them, and the rest are silently lost. This is slower per question and much faster
overall.

**Propose nothing wholesale.** Do not read the discovery artifacts and present a finished storm
for correction. Correcting a plausible model is far harder than building one, and what survives is
the model's assumptions wearing the user's authority. Ask; write down what you are told.

The exception is a *specific* proposal inside one answer — *"that sounds like two events rather
than one: `Item returned` and `Reservation became collectable`. Is it?"* That is a question with a
hypothesis attached, which is useful. A finished document is not.

## Before starting

Read every artifact in `doc/discovery/`, and the existing `domain-spec.md` if there is one. Then
say which area you propose to storm and why, and get agreement on the area before asking about it.

**Pick the area with the most disagreement in it**, not the easiest. The easy area is easy because
it is already understood, so storming it teaches nothing.

## The interview loop

Per area, roughly in this order — but follow the answers, not the list.

1. **Timeline first.** *"Walk me through what happens in this area, in order, as things that have
   already happened."* Past tense from the first sentence: `Item borrowed`, not *borrow item*. Past
   tense is what forces the domain's own words out — a domain has always had a word for the thing
   that happened, and rarely one for the button.

2. **Cause, per event.** *"Who or what made that happen?"* A person or system asking for it is a
   **COMMAND** with an actor. Another event causing it is a **POLICY**. The passage of time is also
   a policy, and worth naming as one — an overdue reservation lapsing has no actor.

3. **Guards.** *"When can that not happen?"* Each answer is a **RULE**. Push for the exception and
   for *why the exception exists*: a rule whose exception is unexplained gets "fixed" later by
   someone who missed the reason.

4. **Consequences.** *"What has to happen automatically once that is true?"* More policies, and
   frequently a second event nobody had named.

5. **What must be visible.** *"What does someone need to see to decide?"* — a **READ** block.

6. **What is computed rather than recorded.** *"Is that stored, or worked out from what we already
   know?"* Worked out is a **DERIVATION**: inputs, output, precedence. It emits no event, and
   saying so explicitly is what stops a ceremonial one appearing later.

7. **Disagreement.** Any point where the answer is *"it depends"*, *"we never decided"*, or two
   answers contradict — stop and record an **open item**. Do not resolve it in the interview; that
   is a different conversation and it will eat this one.

## Not everything fits

`domain-spec.md`'s *When it does not fit* section is the contract; enforce it here. Structural
facts, reference tables, pure calculations and product-wide constraints have no event, and forcing
one produces a sticky that means nothing.

When an answer will not become a command or an event, say so out loud and write it as a **RULE**,
a **DERIVATION** or a **REFERENCE** table. Do not quietly invent an event to keep the shape tidy.
A domain area that turns out to be almost entirely rules is a finding worth stating — it usually
means the area is a policy or a calculation rather than a workflow.

## Writing it down

- **Identifiers on write.** `DS-{area}.{n}`, assigned in the order written. Never renumber a live
  identifier and never reuse a retired one; a retired identifier keeps a line saying what replaced
  it, because tests and code comments cite them.
- **Events past tense**, named as the domain names them. That name is the code's name too — no
  translation layer, ever.
- **Open items go in the single list at the bottom**, as `[H{n}]`, and the area points at them
  with `[?H{n}]`. One list for the whole document, so the review queue is visible in one place.
- **Reasoning stays out.** At most one sentence justifying a rule, in place. The argument belongs
  in `doc/discovery/`; if it is not there, that is a reason to run `/discover`, not to write it
  here.

## Closing an area

Read the written area back — not the transcript, the document — and ask directly whether it is
right. Two failure modes worth naming, because both are invisible to the person who just answered
forty questions:

- **A rule that is really a habit.** *"We always do it that way"* is not the same as *"it must be
  that way"*, and only the second is a domain rule.
- **An event that only exists because a screen exists.** If it cannot be explained without
  mentioning a button, it belongs in `implementation-spec.md`.

Then stop. **One area per session.** The reason both projects' domain specifications were never
really reviewed is that they arrived whole.

## Afterwards

Say which open items are now blocking, and offer `/story-map` once enough of the domain exists to
have journeys through it.
