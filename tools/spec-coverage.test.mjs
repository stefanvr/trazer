// Tests for the coverage tool. Node ships the runner, so the template verifies its own tooling
// without acquiring a single dependency to do it.
//
//     node --test "tools/**/*.test.mjs"
//
// The quoted glob is not decoration: `node --test tools/` treats the directory as a module to run
// and fails with MODULE_NOT_FOUND, which reads as a broken test file rather than a wrong command.
//
// Named as the behaviour claimed rather than the function called, per design-guide.md.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { analyse, declaredIdentifiers, citedIdentifiers } from "./spec-coverage.mjs";

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const CONFIG = { specs: ["specs"], src: ["impl"], tests: ["checks"] };

test("a blockquoted identifier is an illustration, not a declaration", () => {
  const declared = declaredIdentifiers([
    "- **[DS-1.1]** A real rule.",
    "> - **[DS-8.8]** An example rule inside the delete-me block.",
  ].join("\n"));
  assert.deepEqual([...declared.keys()], ["DS-1.1"]);
});

test("an unbolded mention is a cross-reference, not a declaration", () => {
  // Counting these would invent rules out of prose that merely points at one.
  const declared = declaredIdentifiers("See [DS-1.1] for why, and **[IS-2.3]** declares this one.");
  assert.deepEqual([...declared.keys()], ["IS-2.3"]);
});

test("a declaration records the file line it was found on", () => {
  const declared = declaredIdentifiers("intro\n\n- **[DS-4.2]** Blooming outranks foliage.");
  assert.equal(declared.get("DS-4.2"), 3);
});

test("a citation is found whether or not it is emphasised", () => {
  assert.deepEqual(
    [...citedIdentifiers('test("[DS-1.1] holds") // see **[IS-9.1]**')].sort(),
    ["DS-1.1", "IS-9.1"],
  );
});

test("implemented and tested are reported separately, so implemented-but-untested is visible", () => {
  const { declared, implemented, tested } = analyse(FIXTURES, CONFIG);

  assert.deepEqual([...declared.keys()].sort(), ["DS-1.1", "DS-1.2", "DS-1.3"]);

  assert.ok(implemented.has("DS-1.2"), "DS-1.2 is implemented");
  assert.ok(!tested.has("DS-1.2"), "DS-1.2 is not tested — the gap worth seeing");

  assert.ok(implemented.has("DS-1.1") && tested.has("DS-1.1"), "DS-1.1 is both");
  assert.ok(!implemented.has("DS-1.3") && !tested.has("DS-1.3"), "DS-1.3 is neither");
});

test("a test citing a rule that no longer exists is reported as a dead citation", () => {
  const { dead } = analyse(FIXTURES, CONFIG);
  assert.equal(dead.length, 1);
  assert.equal(dead[0].id, "DS-9.9");
  assert.match(dead[0].files[0], /thing-checks\.mjs$/);
});

test("an absent source or test directory is skipped rather than throwing", () => {
  // A project may legitimately have no end-to-end suite yet, and the tool must still run.
  const { declared, tested } = analyse(FIXTURES, { ...CONFIG, tests: ["checks", "does-not-exist"] });
  assert.equal(declared.size, 3);
  assert.ok(tested.has("DS-1.1"));
});
