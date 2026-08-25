#!/usr/bin/env node
// Verifies that every relative markdown link in the document set resolves to a file that exists.
//
// This exists because it did not. `design-guide.md` and `style-guide.md` were referenced eighteen
// times across thirteen files — including the routing tables in README.md and CLAUDE.md that tell a
// reader where every kind of decision goes — while neither file existed, for six goals. Dead links
// in the tables that route decisions quietly teach a reader that the documents cannot be trusted,
// which is the exact failure this document set is built to prevent.
//
// Deliberately checks file existence only, not anchors: an anchor checker needs a markdown parser
// and a slug algorithm per renderer, and would trade a reliable check for a fussy one.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { pathToFileURL } from "node:url";

// Inline code and fenced blocks are stripped first: a snippet demonstrating a link is documentation,
// not a reference, and reporting it would train people to ignore the output.
const FENCE = /```[\s\S]*?```/g;
const INLINE_CODE = /`[^`\n]*`/g;
const LINK = /\[[^\]]*\]\(([^)\s]+)\)/g;

const SKIP = /^(https?:|mailto:|#|<)/;

function markdownFiles(root, out = []) {
  for (const entry of readdirSync(root)) {
    if (entry === "node_modules" || entry === ".git") continue;
    const full = join(root, entry);
    if (statSync(full).isDirectory()) markdownFiles(full, out);
    else if (full.endsWith(".md")) out.push(full);
  }
  return out;
}

export function linksIn(markdown) {
  const stripped = markdown.replace(FENCE, "").replace(INLINE_CODE, "");
  return [...stripped.matchAll(LINK)].map((m) => m[1]).filter((t) => !SKIP.test(t));
}

export function brokenLinks(root) {
  const broken = [];
  for (const file of markdownFiles(root)) {
    for (const target of linksIn(readFileSync(file, "utf8"))) {
      // Strip any anchor before resolving; the file is what is being checked.
      const path = resolve(dirname(file), target.split("#")[0]);
      if (path && !existsSync(path)) {
        broken.push({ from: relative(root, file), target });
      }
    }
  }
  return broken;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = process.argv[2] ?? process.cwd();
  const broken = brokenLinks(root);
  if (broken.length === 0) {
    console.log("links: every relative markdown link resolves");
    process.exit(0);
  }
  console.log(`links: ${broken.length} broken`);
  for (const { from, target } of broken) console.log(`  ${from} -> ${target}`);
  process.exit(1);
}
