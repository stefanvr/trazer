---
name: discover
description: Turn a brainstorm, a data source, or a previous attempt into a frozen input artifact in doc/discovery/. Use at the start of a project, or whenever a new source of understanding appears — a spreadsheet, an old codebase, a conversation that changed your mind. Produces the reasoning trail that domain-spec.md is then distilled from, so that research never has to live inside a specification.
---

# Discover

Produces one **frozen input artifact** in `doc/discovery/`. It exists so that reasoning has a
permanent home that is not a specification.

## Why this exists

The failure this prevents, observed twice: a domain specification that is really the research that
should have produced it. *"The spreadsheet invented the prefix `a:sedum-s` by hand for five plant
types, therefore Planting is an entity"* is good reasoning about a source — and it is reasoning,
sitting in a document whose job is to state what is true. The reader cannot tell the conclusion
from the argument, and the argument is the larger half.

Both halves are worth keeping. They are not worth keeping in the same file, because they have
different lifecycles: the specification is corrected forever, the research is true of a moment and
then done.

## When to run

- Starting a project, before anything is specified.
- A real data source exists — a spreadsheet, an export, a database from a previous attempt.
- A previous version exists and its mistakes are informative.
- A conversation changed your mind about the domain, and the *why* would otherwise be lost.

## The interview

One question at a time. Wait for the answer before asking the next — a batch of five questions
gets one answer covering two of them.

1. **What are we looking at, and why now?** The source, and what prompted opening it.
2. **What do you already believe about this domain?** Recorded up front, so that a belief later
   contradicted by the evidence is visible as a change rather than quietly overwritten.
3. **What is actually in the source?** Go through it concretely. Structure, real values, the odd
   ones. Read the data rather than the schema; the schema is what someone intended.
4. **Where does the source disagree with itself?** Three sheets describing one thing in
   incompatible ways is a finding, not a mess to tidy — it usually means three different concepts
   are wearing one name.
5. **What did the previous attempt get wrong, and why did it happen?** The cause, not the symptom.
   *"Effort went into features while the data stayed thin, because features show visible progress
   and data entry does not"* is a finding that will govern the design. *"The old app was bad"* is
   not.
6. **What is the one thing that must be true for this to be worth building?** Frequently the
   single most useful line in the artifact.

Follow the answers rather than the list. If question 3 turns up something that makes question 5
urgent, go there.

## What the artifact holds

**Findings, evidence, and reasoning.** Quotes and real values from the source. Counts. Dead ends
and what ruled them out. Beliefs that turned out wrong. The argument that leads to a conclusion,
written so the conclusion is *derived* rather than asserted.

**Not rules stated as truth.** The moment a line reads like a specification, it belongs in
`domain-spec.md` instead. The artifact may say *"this suggests plantings need identity separate
from plant type"*; only the specification says *"a planting has identity"*.

## Format

Write to `doc/discovery/YYYY-MM-DD-{slug}.md`, opening with the freeze header exactly:

```markdown
# {Title}

> **Input artifact, frozen {date}.** Not maintained. Where this disagrees with the specifications,
> they are right. Kept for the reasoning, not the rules.

**Source:** {what was examined}
**Prompted by:** {why this was opened}
```

Then the findings, each one earning its place. A finding worth recording has evidence attached; a
finding without evidence is an opinion and belongs in the conversation.

## The freeze rule

**Never edit an artifact after the session that produced it.** When understanding changes, write a
new dated artifact that says what it supersedes. The value of a frozen input is that it records
what was known *at a moment* — an edited one is neither a record nor a specification, and cannot
be trusted as either.

## Handing off

The artifact is the input to `/event-storm`, which reads every artifact in `doc/discovery/` before
starting. Say plainly at the end of the session which findings are ready to become domain rules,
and which are still arguments.
