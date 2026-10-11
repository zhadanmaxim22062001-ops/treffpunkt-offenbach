import { test, expect } from "@playwright/test";

/**
 * The header logo must never go missing again. At every width, in every theme
 * mode (system light, system dark, explicit light, explicit dark) the logo link
 * is in the DOM, exactly one of its light/dark images is rendered with a real
 * box, nothing hides it, and it carries the accessible name. It is also the
 * first tab stop after the skip link, and it does not move when the mobile
 * menu opens.
 */
const NAME = "Gewerbeverein Treffpunkt Offenbach e. V.";
const WIDTHS = [320, 375, 414, 640, 768, 1360];
const MODES = [
  { label: "system light", scheme: "light", explicit: null },
  { label: "system dark", scheme: "dark", explicit: null },
  { label: "explicit light", scheme: "dark", explicit: "light" },
  { label: "explicit dark", scheme: "light", explicit: "dark" },
] as const;

// Classic (non-overlay) scrollbars: headless Chromium hides them by default, which
// would hide exactly the layout jump the menu test is looking for.
test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });

for (const width of WIDTHS) {
  for (const mode of MODES) {
    test(`header logo visible + named: ${width}px, ${mode.label}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.emulateMedia({ colorScheme: mode.scheme });
      if (mode.explicit) {
        await page.addInitScript((v) => localStorage.setItem("tpof-theme", v), mode.explicit);
      }
      await page.goto("/");
      // The saved choice is applied by ThemeToggle after hydration; wait for it.
      if (mode.explicit) await expect(page.locator("html")).toHaveAttribute("data-theme", mode.explicit);

      const link = page.locator("header a[href='/']").first();
      await expect(link).toBeAttached();

      // Exactly one image of the link is actually rendered, with a real box.
      const rendered = await link.evaluate((a) => {
        const out: { src: string; w: number; h: number; ok: boolean }[] = [];
        for (const img of a.querySelectorAll("img")) {
          const r = img.getBoundingClientRect();
          let ok = r.width > 0 && r.height > 0;
          for (let el: Element | null = img; el; el = el.parentElement) {
            const cs = getComputedStyle(el);
            if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") ok = false;
          }
          if (ok) out.push({ src: img.getAttribute("src") ?? "", w: r.width, h: r.height, ok });
        }
        return out;
      });
      expect(rendered, "exactly one logo image rendered in the header").toHaveLength(1);
      expect(rendered[0].w).toBeGreaterThanOrEqual(120); // compact lockup minimum
      expect(rendered[0].h).toBeGreaterThan(0);

      // The rendered file matches the active theme.
      const dark = mode.explicit ? mode.explicit === "dark" : mode.scheme === "dark";
      expect(rendered[0].src.includes("inverse")).toBe(dark);

      // Accessible name, computed by the browser's accessibility rules: hidden twins don't count.
      const named = page.getByRole("banner").getByRole("link", { name: NAME });
      await expect(named).toHaveCount(1);
      await expect(named).toBeVisible();

      // Nothing sticks out sideways.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
    });
  }
}

test("header logo is the first tab stop after the skip link", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveText(/Zum Inhalt springen/);
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveAccessibleName(NAME);
});

for (const width of [320, 375, 414]) {
  test(`logo does not move when the mobile menu opens: ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 });
    await page.goto("/");
    const img = page.locator("header a[href='/'] img:visible").first();
    const before = await img.boundingBox();
    await page.getByRole("button", { name: /Menü/ }).click();
    await expect(page.locator("#mobile-nav")).toBeVisible();
    const after = await img.boundingBox();
    expect(before).not.toBeNull();
    expect(after!.x).toBeCloseTo(before!.x, 1);
    expect(after!.width).toBeCloseTo(before!.width, 1);
  });
}
