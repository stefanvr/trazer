# Recipe: vite-ts

A browser application in TypeScript, unit-tested with Vitest, exercised end to end with Playwright,
and deployed to GitHub Pages by GitHub Actions on every push to `main`.

Distilled from the two projects this template came from, which converged on this shape from
different directions.

## What it assumes

- **A browser surface exists.** Playwright is here because there is something to look at. A library
  or CLI should not take this recipe.
- **GitHub, with Pages already enabled** — *Settings → Pages → Source: GitHub Actions*. A
  repository setting rather than a file, and the one manual step this recipe genuinely cannot do
  for you. `actions/configure-pages` advertises `enablement: true` for exactly this, and it was
  tried on a real repository: it fails with *Resource not accessible by integration*, because
  creating a Pages site is beyond what the default workflow token may do. Observed, not assumed.
- **Node 24 LTS, pinned in `.nvmrc`.** CI reads the same file the developer's shell does, so the
  two cannot drift apart. Pinned to the current Active LTS rather than to whatever happens to be
  installed: Node 20 reached end of life in April 2026, and a template shipping an end-of-life
  runtime hands every project it creates a problem nobody chose. Bumping it means `nvm install 24`
  on each machine before anything runs — which is a real cost, and still smaller than the one it
  avoids.
- **`main` is the integration branch**, matching `workflow.md`.

## What it deliberately leaves out

- **No framework.** Vanilla TypeScript against the DOM. Both origin projects reached for a framework
  later or not at all, and a framework chosen before the domain exists is chosen on vibes. Add one
  when a real screen makes the case, and record the choice in `tech-spec.md`.
- **No CSS framework, no component library.** `style-guide.md` is where the visual decisions go, and
  it is written when there is a first thing to look at.
- **No linter or formatter.** Not because they are wrong, but because they are a preference this
  recipe should not impose. `design-guide.md` owns code shape.
- **No state management, router, or data layer.** Nothing here has any state to manage yet.

## What it gives you on day one

A page that renders, a unit test, two end-to-end tests at desktop and phone viewports, a typecheck,
and a pipeline that runs all three before it deploys anything.

**The build identifier is the point.** The page renders the short commit SHA and the build time,
injected at build time. That is what turns *"the deploy probably worked"* into *"the live site reads
the same SHA as `main`"* — a deploy confirmed rather than assumed. It degrades to `unknown` rather
than throwing, because a missing identifier must never break the page that exists to describe it.

One of the end-to-end tests asserts the page does not scroll sideways on a phone. That is not
decoration: the build identifier is the longest unbreakable-looking string on the page and the most
likely thing to force a horizontal scroll.

## Versions

**There is deliberately no `package-lock.json` here.** Shipping one would pin whatever versions the
recipe's author happened to resolve, which is how a template starts handing every new project a
frozen past. `/scaffold` runs `npm install` and commits the lockfile it generates — and must, since
CI fails without one.

The dependency versions here are a starting point, not a decision. `/scaffold` should check what the
current majors are rather than installing whatever this file happened to say — a recipe that pins
the past is how a template starts costing more than it saves.

## Adapting it

- `base` comes from `VITE_BASE`, which the workflow sets to the repository name, because GitHub
  project pages are served from a subpath. A user site or custom domain leaves it unset.
- Rename `{{PROJECT_NAME}}` in `package.json` and `index.html`.
- Drop Playwright and `e2e/` entirely if the interview said there is no visual surface.
