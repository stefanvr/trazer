// Deliberately separate from vite.config.ts, and deliberately without its `define` block.
//
// Unit tests must see the build identifier *absent*, because that is the case worth asserting: the
// page has to degrade to `unknown` rather than throw. If the tests inherited the build config they
// would only ever exercise the happy path, and the fallback would be untested code that runs in
// exactly the situation nobody planned for.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
  },
});
