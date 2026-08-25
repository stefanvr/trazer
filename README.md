# Trazer

A Traz / Arkanoid-style game for the browser — bat, ball, bricks — built in TypeScript.

Live at **https://stefanvr.github.io/trazer/**. The page shows the commit it was built from, so the
deployed site can be checked against `main` rather than assumed current.

> **Status: skeleton.** The pipeline is real — it builds, tests and deploys. The game is not there
> yet. The first screen arrives with a goal that has a journey behind it, not as a side effect of
> setting up a toolchain.

## Running it

Node 24, pinned in [`.nvmrc`](.nvmrc). Run `nvm use` first — installing a version is not the same as
selecting it, and the difference is silent. See [doc/environment.md](doc/environment.md).

```
npm install
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with hot module replacement |
| `npm test` | Unit tests, then the tooling's own tests. No browser — this is where the bulk of coverage lives |
| `npm run test:e2e` | Playwright against the **built** output, at desktop and phone viewports |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Production bundle into `dist/` |
| `npm run spec:coverage` | Rules with no test, and tests citing rules that no longer exist |

End-to-end tests need a browser once: `npx playwright install chromium`. Not `--with-deps` — that
shells out to `sudo apt-get` and hangs waiting for a password prompt nothing can answer.

## How this project is organised

Decisions live in [`doc/`](doc/), and each document owns exactly one kind of them. Before changing
one, read its **Owns / Not here** header — if what you are writing does not belong there, it belongs
somewhere else in the set. [`CLAUDE.md`](CLAUDE.md) is the routing table.

| Doc | Owns |
|---|---|
| [doc/domain-spec.md](doc/domain-spec.md) | What the game *is*, and the rules it obeys |
| [doc/implementation-spec.md](doc/implementation-spec.md) | How it is played and presented |
| [doc/tech-spec.md](doc/tech-spec.md) | What it is built with, and what that beat |
| [doc/design-guide.md](doc/design-guide.md) | How the code is shaped |
| [doc/style-guide.md](doc/style-guide.md) | How it looks |
| [doc/environment.md](doc/environment.md) | The machine, and what fails silently on it |
| [doc/workflow.md](doc/workflow.md) | How work gets done |
| [doc/implementation-tracking.md](doc/implementation-tracking.md) | What is being built now |
| [doc/discovery/](doc/discovery/) | Frozen input artifacts — never the source of truth |

Two rules make the rest work: **one goal in progress at a time**, and **nothing is ticked off until
what it taught has been promoted** into the document that owns it. Tracking text is deleted when a
goal lands, so an unpromoted lesson is a lost one.

## Deploying

Every push to `main` runs typecheck, unit tests and end-to-end tests, and publishes to GitHub Pages
only if all three pass. There is no manual deploy step and no staging environment.

To confirm a deploy actually landed, compare the SHA on the live page with `main` — that is what the
build identifier is for.
