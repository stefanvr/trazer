---
name: scaffold
description: Set up a new project's toolchain from a recipe — build, tests, CI and deployment — and write doc/tech-spec.md and doc/environment.md as the setup happens. Use when starting a project from this template, or when changing the toolchain of an existing one. Refuses to run in the template repository itself.
---

# Scaffold

Turns a copy of the template into a project that builds, tests and deploys, and records how — while
it happens rather than afterwards.

## First: refuse to run in the template

If `.dev-template` exists in the repository root, **stop.** Say that this is the template itself,
that scaffolding here would turn it into an application, and that the copy sequence is in
`.dev-template` — then read that file and walk the reader through its steps.

Point at the file rather than reciting a list of your own. It is the single source for the sequence,
`README.md` points at it too, and a list restated in a third place is a third place to drift.

Never offer to delete the marker as a way past this. The marker is not the obstacle; being in the
wrong directory is.

## The interview

One question at a time, as everywhere else. Most answers are short.

1. **What is this project called, and what is it for in one line?** Goes into `README.md` and the
   top of `tech-spec.md`.
2. **Does it have a visual surface?** Decides whether Playwright and `style-guide.md` earn their
   place. A library or CLI does not want a browser test runner.
3. **Which recipe?** Offer what is in `recipes/`, and say plainly when none fits — going freehand is
   a supported answer, and the resulting setup becomes a recipe if it proves itself.
4. **Where will the remote live?** Owner and repository name. Needed for the deploy configuration,
   not only for git.

## Applying a recipe

A recipe is a directory under `recipes/` holding a proven setup and a `RECIPE.md` saying what it
assumes and what it deliberately leaves out. Copy it in, then adapt: project name, paths, the
things the interview settled.

**Do not install what nothing uses yet.** A dependency added because the recipe's origin project
needed it is exactly the kind of thing that is never removed. If the recipe carries something this
project has no use for, drop it and say so.

**Install before the first commit, and commit the lockfile.** Run `npm install` as part of
scaffolding, and include `package-lock.json` in the scaffold commit. CI needs it for two separate
reasons: `npm ci` refuses to run without one, and `actions/setup-node`'s dependency cache fails the
job outright when it cannot find one — before a single test executes. A recipe cannot ship a
lockfile, because that would pin whatever versions its author happened to have, so generating it is
the scaffold's job and is easy to forget. It has already failed one first CI run this way.

**Scripts are named the same in every project** — `dev`, `test`, `test:e2e`, `typecheck`,
`spec:coverage` — so that muscle memory and the other skills both transfer. A script name pointing
at something that does not exist is worse than an absent script; add it when it works.

## Writing the documents as you go

This is the part that matters most, and the reason `/scaffold` exists rather than a starter folder.

**`tech-spec.md`** — fill in the stack table *with rejected alternatives*, one clause each, as each
choice is made. A recipe's `RECIPE.md` already carries the reasoning for its own choices; copy what
applies rather than re-deriving it, and record anything decided differently here.

**`environment.md`** — write each step **immediately after doing it**, before starting the next one.
Not at the end. Setup notes written up afterwards end up in a second place — a readme, a wiki, a
chat — and then disagree with this document, which is precisely the failure this ordering prevents.

Record what the console *actually said*, not what its documentation claims. When a step surprises
you, that surprise is the most valuable line on the page: it belongs under **Silent failures** if it
succeeded wrongly, or **Tools that assume a desktop** if it hung.

## Git, and the remote

Perform the local part, guide and then **verify** the remote part.

1. `git init`, a `.gitignore` from the recipe, and one commit for the scaffold.
2. Guide creating the repository — this needs a browser or `gh`, and neither is assumable.
3. Add the remote **over SSH**, never the HTTPS URL: HTTPS prompts for credentials no helper
   supplies and hangs rather than failing (`environment.md`, silent failure 3).
4. **Confirm it worked** with `git ls-remote` and `ssh -T git@github.com`, which names the
   authenticated account. Do not assume a push target exists because a URL was typed.

Step 4 is not ceremony. The workflow says *push before review*, and a remote that was never verified
turns that into an instruction nobody can follow at the moment it is first needed.

## Deploying on day one

The skeleton deploys before there is anything worth deploying. The effort is identical whenever it
happens, and doing it now flushes out the deployment-only failures while there are three files
rather than three hundred — credentials with the wrong scope, a missing registration, a workflow
that builds the wrong directory. None of those are visible to any local test.

**Pages enablement is manual, and must be guided then verified** like the remote is. *Settings →
Pages → Source: GitHub Actions*, done once by the owner. Do not reach for
`actions/configure-pages`'s `enablement: true` to avoid it — that has been tried and it fails, since
creating a Pages site is beyond the default workflow token. Record the step in `environment.md`
under **Provisioning** as it is done.

**Inject a build identifier** — short commit SHA and UTC build time — and render it somewhere in the
running application. It is what turns *"the deploy probably worked"* into *"the live site reads the
same SHA as `main`"*. Degrade to `unknown` rather than throwing when it is absent.

## Finishing

Verify by actually doing it, not by reasoning about it: run `npm test` and `npm run test:e2e`, push,
and confirm the live URL shows the identifier matching `main`. Then say what was set up, what was
deliberately left out, and what the first goal should probably be — `/discover` or `/event-storm`,
depending on whether there is prior material to read.
