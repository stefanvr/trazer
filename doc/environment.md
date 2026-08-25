# Environment

**Owns.** How to actually run this on a real machine, and which parts of that are non-negotiable
versus merely how one person's setup happens to work.

**Not here.** Technical *choices* — which runtime, which test framework, which host — belong in
[tech-spec.md](tech-spec.md). This document decides nothing; it describes what is true. That is why
they are separate: tech-spec changes when the project changes, this changes when a machine changes,
and mixing them makes both harder to trust.

**Write the silent failures first.** A command that errors is self-correcting — you see it and fix
it. A command that quietly does the *wrong thing* is not, and that is the class of problem this
document exists for.

> **Keep personal details out of this file.** It is committed and may be public. Describe the
> *failure mode* and how to check for it — never email addresses, SSH configuration, key names, or
> absolute paths into someone's home directory. Everything below is written to be useful without
> any of that.

Written by `/scaffold` **as each step is done**, not reconstructed afterwards. That ordering is the
whole point: setup notes written up later end up in a second place — a readme, a wiki, a chat — and
then quietly disagree with this one.

---

## Invariants

What must be true regardless of whose machine it is. Everything below this section is one machine's
way of satisfying these.

- **Node 24 (Active LTS)**, and *actually* that version at the moment a command runs — see the
  first silent failure below. Pinned by `.nvmrc` at the repository root, which CI reads too, so the
  two cannot drift apart.
- **Commits carry the identity that owns this repository**, not another identity configured on the
  same machine. Verify rather than assume: `git log --format='%an <%ae>' | sort -u`.
- **Push access to the remote over SSH.** See silent failure 3.
- **A git repository with at least one commit**, for any command whose output is checked — see
  silent failure 6. A source tree alone is not enough to produce a deployable build.

---

## This machine

Windows 11 host, WSL Ubuntu 24.04, edited from VS Code on the Windows side. Personal to one setup;
a second contributor adds their own section rather than editing this one.

The repository path is deliberately **not recorded** — it is whatever the editor workspace is, and
every command below is written to work from there without knowing it.

### Silent failures

**1. The Node version depends on which shell flags you use.** This is the dangerous one, because
both invocations succeed:

| Invocation | Node |
|---|---|
| `wsl.exe -e bash -lc` | the **system** Node — old, possibly end-of-life |
| `wsl.exe -e bash -ic` | **nvm's** Node, the one this project targets |

nvm initialises from the *interactive* shell startup file, so a login shell never loads it and
silently falls back to whatever the distribution installed. A build, test run or deploy can complete
on the wrong runtime and merely behave differently. **Use the interactive flag.** Check with
`wsl.exe -e bash -ic 'node -v'` before trusting any result that depends on the runtime.

**Installing a version is not the same as selecting it.** nvm resolves a fresh interactive shell to
its **default alias**, and `.nvmrc` is read only by an explicit `nvm use`. Install Node 24 while the
default alias still points at 20 and every one-shot command keeps running on 20 — with the project's
`.nvmrc` saying 24 and CI honouring it. Both succeed. They simply run different runtimes, and the
divergence surfaces as a behaviour difference rather than an error.

Two ways out, and they are not equivalent: run `nvm use` in the project directory before the command
(reads `.nvmrc`, scoped to that shell), or move the default alias with `nvm alias default 24`. The
second is **global** — every other project on the machine, including ones pinned to an older
version, gets it too. Check with `node -v` and `nvm alias default`, never by recalling what was
installed.

**2. Committing from the Windows side attributes the commit to the wrong person.** The Windows host
and WSL each carry their own global git identity, and on this machine they differ — one is a work
identity, one is the personal identity this repository should use. Git does not warn; the commit
simply lands under the wrong name. **Run every git command inside WSL**, and check attribution with
the command in the invariants above.

**3. The HTTPS remote URL hangs rather than failing.** HTTPS is not configured here and prompts for
credentials that no helper supplies, so a push waits on input that never arrives. Use the SSH remote
instead, and confirm with `ssh -T git@github.com`, which names the authenticated account.

**4. Nesting apostrophes or heredocs inside an interactive-shell command string breaks**, and the
error points somewhere unrelated — `unexpected EOF while looking for matching`. Hit while writing
ordinary English contractions into a document. Write files with an editor or a file-writing tool
rather than assembling them inside a shell string; this one has cost time more than once.

Fired again while scaffolding this project, writing `tech-spec.md` through a quoted heredoc: the
error read `line 127: unexpected EOF while looking for matching '` and line 127 was the end of the
document, nowhere near any of the apostrophes in *project's* and *recipe's* that actually caused it.
A quoted heredoc does not save you, because the outer `bash -c` string is parsed first. The remedy
above is not a preference — it is the only thing that reliably works.

**5. A variable inside a command string sent across the WSL boundary can arrive empty — and an
unset variable expands to nothing rather than failing.** Assigning `R=…` and then writing
`cp -r $R/. target/` in the same string produced `cp -r /. target/`: an attempt to copy the entire
filesystem root, which ran for a while and left 3.4 GB of nonsense before failing on an unrelated
error. Nothing warned, because an empty expansion is a perfectly valid command.

Three habits prevent it, all cheap: **use absolute paths rather than variables** across the
boundary, **`set -u`** so an unset variable aborts instead of vanishing, and — best — **write the
script to a file and run that**, since the quoting layer is where this whole class of problem
lives. This is the same root cause as silent failure 4, and between them they have cost more time
than anything else on this page.

**6. `npm run build` outside a git repository succeeds, and deploys a page that cannot be checked.**
`vite.config.ts` asks git for the commit SHA and degrades to `unknown` when there is no repository —
correct behaviour, and invisible. The build exits zero, produces a complete `dist/`, and the page
renders `unknown · <timestamp>`. Nothing indicates that the one thing making a deploy confirmable is
missing.

Observed while scaffolding, in the window between copying the recipe in and running `git init`:
`npm test` passed, `npm run typecheck` passed, and `npm run test:e2e` failed two of six with
`locator resolved to <p class="build" data-testid="build-info">unknown · 2026-08-25 16:32 UTC</p>`.

The end-to-end suite is the only thing that catches this, which is exactly why it asserts the
identifier is **not** `unknown` rather than merely present. **Order matters: `git init` and a first
commit come before any build whose output will be trusted.** In CI the equivalent hazard is a
checkout without git history — `actions/checkout` supplies `GITHUB_SHA` regardless, so CI takes the
environment-variable path and never touches git, but a tarball export would fail the same way.

### Tools that assume a desktop

These do not fail silently — they hang, which is its own kind of time sink, because nothing
indicates what is being waited for.

**Anything that opens a browser** — OAuth logins, cloud CLI sign-ins — waits on a browser that does
not exist inside WSL. Either use the tool's no-localhost equivalent, which prints a URL to paste
into a Windows browser, or give WSL a browser once in the file the interactive shell sources:
`export BROWSER="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"`. WSL2 forwards Windows
localhost into the distro, so the OAuth callback still reaches the CLI.

**`npx playwright install --with-deps` hangs.** The `--with-deps` part shells out to `sudo apt-get`,
and a non-interactive shell has no stdin to answer the password prompt with. Use
`npx playwright install chromium` — the browser download itself needs no privileges.

**Background processes** need the calling tool's own backgrounding rather than a trailing `&` inside
a `wsl.exe` call: a one-shot invocation tears down its children when it exits, so the dev server
dies immediately while the launch command still looks like it succeeded.

---

## Provisioning

One-time steps done by the owner, outside the repository — accounts, projects, credentials, DNS.
Written here **as they are done**, recording what the console actually said rather than what the
documentation claims it says.

- **Node 24 available through nvm, and selected by default.** Confirmed before anything was
  installed: `node -v` → `v24.19.0`, and `nvm alias default` → `default -> 24 (-> v24.19.0)`. Both
  checks matter and neither substitutes for the other — see silent failure 1.
- **SSH access to GitHub.** `ssh -T git@github.com` → `Hi stefanvr! You've successfully
  authenticated, but GitHub does not provide shell access.` That greeting naming the account is the
  confirmation; a URL having been typed is not.
- **`gh` is not installed on this machine.** `command -v gh` → nothing. Repository creation is
  therefore a browser step, not a scripted one, and any instruction assuming `gh` has to be
  translated.
- **Repository `stefanvr/trazer` exists and was empty** — no README, no `.gitignore`, no licence.
  Confirmed before pushing with `git ls-remote git@github.com:stefanvr/trazer.git`, which exited 0
  and listed no refs. Both halves of that matter: a *missing* repository exits 128 with
  `ERROR: Repository not found`, and an *initialised* one lists a ref and would give the first push
  a divergent history to reconcile, over files this project already has.

  **Check the exit code without a pipe.** `git ls-remote … | head` then `echo $?` reports `head`'s
  status, not git's, so a missing repository reads as success. Redirect to a file and test the code
  directly.
- **Remote added over SSH**, never HTTPS: `git@github.com:stefanvr/trazer.git`. See silent failure 3.
  Confirmed by pushing and comparing `git rev-parse --short HEAD` with
  `git rev-parse --short origin/main` — both `27cc9cf`.
- **GitHub Pages — enabled by the owner** at *Settings → Pages → Source: **GitHub Actions***. A
  repository setting rather than a file, and the one step the pipeline genuinely cannot do for
  itself: `actions/configure-pages` advertises `enablement: true` for exactly this and fails with
  *Resource not accessible by integration*, because creating a Pages site is beyond what the default
  workflow token may do. Observed on a real repository, not assumed.

  **The before and after, observed.** Run 1 (`27cc9cf`) had `build` green through every step and
  `deploy` failing at `actions/deploy-pages@v4` — the correct and legible failure, since nothing
  broken reaches the site. Runs 2 and 3 succeeded once the setting was on.

  Confirmed at the live site rather than from the job's green tick: `https://stefanvr.github.io/trazer/`
  returns 200, its asset paths are `/trazer/assets/…` — the thing that silently 404s when `VITE_BASE`
  is wrong — and the bundle contains `` `cc704bd` ``, matching `git rev-parse --short origin/main`.
  That match is the entire reason the identifier exists.

  **The Pages API is not a check.** `GET /repos/{owner}/{repo}/pages` returns
  `404` unauthenticated even for a public repository with Pages live, so it reports *not enabled* and
  *no permission to ask* identically. Fetch the site and read the SHA instead.

---

## When someone else joins

The section above is tuned to one person's setup, and that is a deliberate trade: for a solo project
the specifics *are* the value, and a generic version would lose exactly the part worth having.

It does not survive contact with a contributor whose environment differs. When that happens, do not
genericise it into vagueness — **promote whatever actually matters up into Invariants**, and let
each person's setup satisfy those however it does. Add a second "This machine" section rather than
merging them into a description that fits neither.

The invariants were always the shared part. The rest was only ever one machine's answer to them.
