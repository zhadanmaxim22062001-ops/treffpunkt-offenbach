import { test, expect } from "@playwright/test";

/**
 * Behavioural coverage for the OF-Radar ten-day row
 * (components/RadarDayRow.tsx) that the generic route sweep in
 * visual.spec.ts doesn't exercise: window paging (URL param and click),
 * day selection, the empty-window state, and the one real multi-day entry
 * in the dataset (2026 Offenbacher Woche, 28.–31. Mai) marking and
 * reporting its full range from any day inside it.
 */

test("window paging via ?ab= renders the requested window and » advances it by ten days", async ({ page }) => {
  await page.goto("/radar?ab=2026-09-01");
  await expect(page.locator('[aria-live="polite"]')).toHaveText("01.09.2026 – 10.09.2026");

  await page.getByRole("link", { name: "Zehn Tage vor" }).click();
  await expect(page).toHaveURL(/ab=2026-09-11/);
  await expect(page.locator('[aria-live="polite"]')).toHaveText("11.09.2026 – 20.09.2026");

  await page.getByRole("link", { name: "Zehn Tage zurück" }).click();
  await page.getByRole("link", { name: "Zehn Tage zurück" }).click();
  await expect(page).toHaveURL(/ab=2026-08-22/);
  await expect(page.locator('[aria-live="polite"]')).toHaveText("22.08.2026 – 31.08.2026");
});

test("clicking a day selects it and shows its detail panel", async ({ page }) => {
  await page.goto("/radar?ab=2026-05-25");
  const day28 = page.locator('[role="radio"][aria-label*="28. Mai"]');
  await day28.click();
  await expect(day28).toHaveAttribute("aria-checked", "true");
  await expect(page.locator(".eyebrow").filter({ hasText: "28. Mai 2026" })).toBeVisible();
});

test("an empty window shows an honest empty state with no false entries", async ({ page }) => {
  await page.goto("/radar?ab=2026-11-01");
  await expect(page.locator('[aria-live="polite"]')).toHaveText("01.11.2026 – 10.11.2026");
  await expect(page.getByText("Keine Termine vom 01.11.2026 – 10.11.2026.")).toBeVisible();
  // No day in this window should carry an entry dot.
  const dots = page.locator('[role="radio"] span.rounded-full');
  await expect(dots).toHaveCount(0);
});

test("the Offenbacher Woche range marks all four days and reports the full range from any one of them", async ({ page }) => {
  await page.goto("/radar?ab=2026-05-25");

  const days = [28, 29, 30, 31];
  for (const d of days) {
    const cell = page.locator(`[role="radio"][aria-label*="${d}. Mai"]`);
    await expect(cell.locator("span.rounded-full")).toHaveCount(1);
  }

  // Selecting an interior day (30) should show the event once, with its
  // full 28.–31. range — not "day 3 of 4" or a truncated view.
  await page.locator('[role="radio"][aria-label*="30. Mai"]').click();
  const detail = page.locator("text=Offenbacher Woche").first();
  await expect(detail).toBeVisible();
  await expect(page.getByText(/28\.05\.2026.*31\.05\.2026/)).toBeVisible();
});

test("keyboard: ArrowRight from the last day of a window pages into the next window, Home/End jump within it", async ({ page }) => {
  await page.goto("/radar?ab=2026-09-01");
  const day10 = page.locator('[role="radio"][aria-label*="10. September"]');
  await day10.click();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[aria-live="polite"]')).toHaveText("11.09.2026 – 20.09.2026");
  const active = page.locator('[role="radio"][aria-label*="11. September 2026"]');
  await expect(active).toBeFocused();

  await page.keyboard.press("End");
  await expect(page.locator('[role="radio"][aria-label*="20. September 2026"]')).toBeFocused();

  await page.keyboard.press("Home");
  await expect(page.locator('[role="radio"][aria-label*="11. September 2026"]')).toBeFocused();
});
