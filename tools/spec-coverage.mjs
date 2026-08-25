#!/usr/bin/env node
// Reports the binding between the specifications and the code — CLAUDE.md's "rules carry
// identifiers" rule, and the promise made in domain-spec.md, build-stage and scaffold.
//
// Deliberately runner-agnostic: it reads identifiers out of test *names*, and never parses any test
// runner's output. Two of the projects this template came from use different runners and both use
// Playwright as well, so parsing output would bind the template to one of them and break on the
// next project.
//
// Implementation and test coverage are reported *separately*. A module header citing a rule means
// it was built; a test citing it means it was verified. Collapsing the two would hide the one case
// that matters most — implemented but untested.
//
// Exit code is non-zero only for a dead citation, never for an uncovered rule. On a young project
// most rules legitimately have no test yet, and a command that is red every day gets removed from
// CI within a week.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULTS = {
  specs: ["doc"],
  src: ["src"],
  tests: ["test", "e2e"],
};

const CODE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".svelte", ".vue"];

// Bolded and bracketed is how a specification declares a rule: **[DS-4.2]**. The bold markers are
// part of the match on purpose — a bare [DS-4.2] in prose is a cross-reference, not a declaration,
// and counting those would invent rules that do not exist.
const DECLARATION = /\*\*\[((?:DS|IS)-\d+\.\d+)\]\*\*/g;

// A citation is any mention, bold or not, since a test name or a module comment has no reason to
// use markdown emphasis.
const CITATION = /\[((?:DS|IS)-\d+\.\d+)\]/g;

export function declaredIdentifiers(markdown) {
  const found = new Map();
  markdown.split(/\r?\n/).forEach((line, i) => {
    // Blockquoted lines are illustrative examples — the "delete this whole block" material every
    // specification ships with. Counting those would report the template's own worked examples as
    // uncovered rules, which is noise on the very first run.
    if (/^\s*>/.test(line)) return;
    for (const m of line.matchAll(DECLARATION)) {
      if (!found.has(m[1])) found.set(m[1], i + 1);
    }
  });
  return found;
}

export function citedIdentifiers(text) {
  return new Set([...text.matchAll(CITATION)].map((m) => m[1]));
}

function walk(dir, predicate, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, predicate, out);
    else if (predicate(full)) out.push(full);
  }
  return out;
}

function loadConfig(root) {
  const pkgPath = join(root, "package.json");
  if (!existsSync(pkgPath)) return DEFAULTS;
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    return { ...DEFAULTS, ...(pkg.specCoverage ?? {}) };
  } catch {
    // A malformed package.json is somebody else's error to report; fall back rather than adding a
    // second, confusing one.
    return DEFAULTS;
  }
}

export function analyse(root, config = loadConfig(root)) {
  const declared = new Map();
  for (const dir of config.specs) {
    for (const file of walk(join(root, dir), (f) => f.endsWith("-spec.md"))) {
      for (const [id, line] of declaredIdentifiers(readFileSync(file, "utf8"))) {
        if (!declared.has(id)) declared.set(id, `${relative(root, file)}:${line}`);
      }
    }
  }

  const collect = (dirs) => {
    const byId = new Map();
    for (const dir of dirs) {
      for (const file of walk(join(root, dir), (f) => CODE_EXTENSIONS.some((e) => f.endsWith(e)))) {
        for (const id of citedIdentifiers(readFileSync(file, "utf8"))) {
          if (!byId.has(id)) byId.set(id, []);
          byId.get(id).push(relative(root, file));
        }
      }
    }
    return byId;
  };

  const tested = collect(config.tests);
  const implemented = collect(config.src);

  const dead = [];
  for (const [id, files] of [...tested, ...implemented]) {
    if (!declared.has(id)) dead.push({ id, files });
  }

  return { declared, tested, implemented, dead };
}

export function report({ declared, tested, implemented, dead }) {
  const lines = [];
  const mark = (yes) => (yes ? "yes" : " — ");

  lines.push(`spec coverage — ${declared.size} identifier${declared.size === 1 ? "" : "s"} declared`);
  lines.push("");

  const counts = { both: 0, implOnly: 0, testOnly: 0, neither: 0 };
  for (const id of [...declared.keys()].sort()) {
    const i = implemented.has(id);
    const t = tested.has(id);
    if (i && t) counts.both++;
    else if (i) counts.implOnly++;
    else if (t) counts.testOnly++;
    else counts.neither++;
    lines.push(`  ${id.padEnd(9)} implemented ${mark(i)}   tested ${mark(t)}   ${declared.get(id)}`);
  }

  lines.push("");
  lines.push(`  ${counts.both} implemented and tested`);
  // Named as the thing worth acting on rather than as a statistic: this is the case the separate
  // reporting exists for.
  lines.push(`  ${counts.implOnly} implemented but NOT tested`);
  lines.push(`  ${counts.testOnly} tested but no implementation cites them`);
  lines.push(`  ${counts.neither} neither`);

  if (dead.length) {
    lines.push("");
    lines.push(`  dead citations (${dead.length}) — these fail:`);
    for (const { id, files } of dead) lines.push(`    ${id} cited by ${files.join(", ")}, but no such rule is declared`);
  }

  return lines.join("\n");
}

// Run the CLI only when invoked directly. Comparing resolved file URLs rather than matching on the
// basename: the test file imports this module, and a basename match would fire the CLI — including
// its process.exit — in the middle of the test run.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = process.argv[2] ?? process.cwd();
  const result = analyse(root);
  console.log(report(result));
  process.exit(result.dead.length > 0 ? 1 : 0);
}
