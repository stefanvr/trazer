// The journey, end to end — the only test that crosses §1 Game setup, §2 The arena, §3 The map and
// §4 Endings together.
//
// Journeys carry no identifiers of their own, so naming the surfaces it passes through is the only
// binding this test has to implementation-spec.md. Kept deliberately thin: every rule it walks past
// is already covered by a unit test, and what is proved here is that the pieces are actually wired
// to each other, which no unit test can see.

import { test, expect, type Page } from "@playwright/test";

/** Clear the level currently on screen and land back on the map. */
async function clearLevel(page: Page): Promise<void> {
  await page.getByTestId("clear-level").click();
  await expect(page.getByTestId("map")).toBeVisible();
}

/** Step with the keyboard, then enter what is there and clear it. */
async function goAndClear(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("level")).toBeVisible();
  await clearLevel(page);
}

test("§1 → §2 → §3 → §4: a run begins playing, crosses the map, and ends out of lives", async ({
  page,
}) => {
  await page.goto("/");

  // §1, §2 — [IS-1.1]: no title screen; the run is already playing the start level.
  await expect(page.getByTestId("level-name")).toHaveText("Level C");
  await expect(page.getByTestId("lives")).toContainText("3");

  // §3 — clearing returns the player to the map, with what C unlocks already open.
  await clearLevel(page);
  await expect(page.locator('[data-state="open"]')).toHaveCount(4);
  await expect(page.locator('[data-state="locked"]')).toHaveCount(2);
  await expect(page.locator('[data-here="true"]')).toHaveCount(1);

  // §3 — [IS-3.4], [IS-3.6]: step with the keyboard and enter what is there.
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("level-name")).toHaveText("Level E");

  // §2 — [IS-2.3]: a life lost is not an exit; the level continues, one life poorer.
  await page.getByTestId("lose-a-life").click();
  await expect(page.getByTestId("level-name")).toHaveText("Level E");
  await expect(page.getByTestId("lives")).toContainText("2");

  // §4 — [IS-4.1], [IS-4.3]: the last life ends the run, and the ending says which ending it was.
  await page.getByTestId("lose-a-life").click();
  await page.getByTestId("lose-a-life").click();
  await expect(page.getByTestId("ending")).toBeVisible();
  await expect(page.getByTestId("ending-reason")).toHaveAttribute("data-because", "lives spent");
  await expect(page.getByTestId("levels-cleared")).toContainText("1");

  // §4 — [IS-4.2]: a new game, with lives restored and nothing carried over.
  await page.getByTestId("new-game").click();
  await expect(page.getByTestId("level-name")).toHaveText("Level C");
  await expect(page.getByTestId("lives")).toContainText("3");
});

test("§3 — [IS-3.5] a level that will not open says which of the two reasons applies", async ({
  page,
}) => {
  await page.goto("/");
  await clearLevel(page);

  // Standing on the level just cleared: entering must refuse, and say it is cleared rather than
  // locked. The two look identical on the map and lead to opposite actions.
  await page.locator('[data-action="enter"]').click();
  await expect(page.getByTestId("map-message")).toContainText("already cleared");
  await expect(page.getByTestId("map")).toBeVisible();

  // Stepping somewhere new clears the refusal rather than leaving it standing.
  await page.keyboard.press("ArrowUp");
  await expect(page.getByTestId("map-message")).toHaveCount(0);
});

test("§2 → §4 — [DS-1.13] a game can be abandoned from inside a level", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("abort").click();
  await expect(page.getByTestId("ending-reason")).toHaveAttribute("data-because", "abandoned");
  // [IS-4.3] — told apart from running out of lives, which needs different words.
  await expect(page.getByTestId("ending-reason")).toHaveText("Game abandoned");
});

test("§3 — [IS-3.7] clearing all seven strands the player, and the map says so", async ({
  page,
}) => {
  await page.goto("/");
  await clearLevel(page); // C

  await goAndClear(page, "ArrowUp"); // N
  await page.keyboard.press("ArrowDown"); // back to C
  await goAndClear(page, "ArrowDown"); // S
  await page.keyboard.press("ArrowUp"); // back to C
  await goAndClear(page, "ArrowLeft"); // W
  await page.keyboard.press("ArrowRight"); // back to C
  await goAndClear(page, "ArrowRight"); // E
  await goAndClear(page, "ArrowUp"); // Eu
  await page.keyboard.press("ArrowDown"); // back to E
  await goAndClear(page, "ArrowDown"); // Ed

  await expect(page.locator('[data-state="cleared"]')).toHaveCount(7);
  await expect(page.locator('[data-state="open"]')).toHaveCount(0);
  await expect(page.getByTestId("map-message")).toContainText("no end level yet");
  // The run is not over: it has all three lives. This is an unfinished game, not an ending.
  await expect(page.getByTestId("ending")).toHaveCount(0);
});

test("[IS-1.2] the build identifier survives onto the later screens", async ({ page }) => {
  await page.goto("/");
  // It is asserted on the first screen by smoke.spec.ts; what matters here is that re-rendering
  // does not drop it, since every screen after the first is drawn by a different view.
  await expect(page.getByTestId("build-info")).not.toHaveText(/unknown/);

  await clearLevel(page); // the map
  await expect(page.getByTestId("build-info")).not.toHaveText(/unknown/);

  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Enter"); // a second level
  await expect(page.getByTestId("build-info")).not.toHaveText(/unknown/);

  await page.getByTestId("abort").click(); // the ending
  await expect(page.getByTestId("build-info")).not.toHaveText(/unknown/);
});
