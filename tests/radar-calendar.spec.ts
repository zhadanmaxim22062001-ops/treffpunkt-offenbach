import { test, expect } from "@playwright/test";

/**
 * Behavioural coverage for the OF-Radar month calendar
 * (components/RadarCalendarWidget.tsx) that the generic route sweep in
 * visual.spec.ts doesn't exercise: month navigation (URL param and
 * click), day selection, the empty-month state, and the one real
 * multi-day entry in the dataset (2026 Offenbacher Woche, 28.–31. Mai)
 * marking and reporting its full range from any day inside it.
 */

test("month navigation via ?monat= renders the requested month and Weiter advances it", async ({ page }) => {
  await page.goto("/radar?monat=2026-09");
  await expect(page.locator('[aria-live="polite"]')).toHaveText("September 2026");

  await page.getByRole("link", { name: "Nächster Monat" }).click();
  await expect(page).toHaveURL(/monat=2026-10/);
  await expect(page.locator('[aria-live="polite"]')).toHaveText("Oktober 2026");

  await page.getByRole("link", { name: "Voriger Monat" }).click();
  await page.getByRole("link", { name: "Voriger Monat" }).click();
  await expect(page).toHaveURL(/monat=2026-08/);
  await expect(page.locator('[aria-live="polite"]')).toHaveText("August 2026");
});

test("clicking a day selects it and shows its detail panel", async ({ page }) => {
  await page.goto("/radar?monat=2026-05");
  const day28 = page.locator('[role="gridcell"][aria-label*="28. Mai"]');
  await day28.click();
  await expect(day28).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".eyebrow").filter({ hasText: "Mai 2026" })).toBeVisible();
});

test("an empty month shows an honest empty state with no false entries", async ({ page }) => {
  await page.goto("/radar?monat=2026-11");
  await expect(page.locator('[aria-live="polite"]')).toHaveText("November 2026");
  await expect(page.getByText("Keine Termine im November 2026.")).toBeVisible();
  // No day in this month should carry an entry dot.
  const dots = page.locator('[role="gridcell"] span.rounded-full');
  await expect(dots).toHaveCount(0);
});

test("the Offenbacher Woche range marks all four days and reports the full range from any one of them", async ({ page }) => {
  await page.goto("/radar?monat=2026-05");

  const days = [28, 29, 30, 31];
  for (const d of days) {
    const cell = page.locator(`[role="gridcell"][aria-label*="${d}. Mai"]`);
    await expect(cell.locator("span.rounded-full")).toHaveCount(1);
  }

  // Selecting an interior day (30) should show the event once, with its
  // full 28.–31. range — not "day 3 of 4" or a truncated view.
  await page.locator('[role="gridcell"][aria-label*="30. Mai"]').click();
  const detail = page.locator("text=Offenbacher Woche").first();
  await expect(detail).toBeVisible();
  await expect(page.getByText(/28\.05\.2026.*31\.05\.2026|28\.\s*[–-]\s*31\.\s*Mai/)).toBeVisible();
});

test("keyboard: ArrowRight from the last day of a month crosses into the next month", async ({ page }) => {
  await page.goto("/radar?monat=2026-09");
  const day30 = page.locator('[role="gridcell"][aria-label*="30. September"]');
  await day30.click();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[aria-live="polite"]')).toHaveText("Oktober 2026");
  const active = page.locator('[role="gridcell"][aria-label="1. Oktober 2026"]');
  await expect(active).toBeFocused();
});
