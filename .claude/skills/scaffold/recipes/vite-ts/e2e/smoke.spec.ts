// End-to-end smoke tests, run at both viewports against the *built* output.
//
// Three assertions, each of which fails if something real breaks: the page rendered at all, the
// build identifier was actually injected by the build (not the `unknown` fallback), and nothing
// forces a phone to scroll sideways.

import { test, expect } from "@playwright/test";

test("the page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("the build identifier was injected, not defaulted", async ({ page }) => {
  await page.goto("/");
  const build = page.getByTestId("build-info");
  await expect(build).toBeVisible();
  // The fallback is correct behaviour in a unit test and a failure here: a deployed page showing
  // `unknown` cannot be checked against main, which is the whole reason the identifier exists.
  await expect(build).not.toHaveText(/unknown/);
});

test("nothing forces the page to scroll sideways", async ({ page }) => {
  await page.goto("/");
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});
