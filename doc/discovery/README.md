# Discovery

**Owns.** The reasoning that led to the specifications: brainstorms, data analyses, looks at a
previous attempt, the arguments behind a decision.

**Not here.** Anything stated as true of the product. The moment a line reads like a specification
it belongs in [domain-spec.md](../domain-spec.md) or
[implementation-spec.md](../implementation-spec.md) instead.

**These are frozen inputs, never sources of truth.** Where an artifact here disagrees with a
specification, the specification is right. An artifact records what was known *at a moment*; a
specification is corrected forever. Mixing the two lifecycles is what produced the failure this
whole directory exists to prevent — a domain specification that was really the research that should
have produced it, where the reader could not tell the conclusion from the argument, and the argument
was the larger half.

## The rules

- **One file per session**, named `YYYY-MM-DD-{slug}.md`.
- **Never edited after the session that produced it.** When understanding changes, write a new dated
  artifact saying what it supersedes. An edited input is neither a record nor a specification, and
  cannot be trusted as either.
- **Every finding carries its evidence** — a quote, a real value, a count. A finding without
  evidence is an opinion, and belongs in the conversation rather than in a file.

Each artifact opens with the freeze header:

```markdown
> **Input artifact, frozen {date}.** Not maintained. Where this disagrees with the specifications,
> they are right. Kept for the reasoning, not the rules.
```

Written by `/discover`, and read by `/event-storm` before it starts.

**Starting a project?** Delete this file's contents down to the rules, or leave it as it is — the
rules are the same everywhere. The artifacts themselves are yours.
