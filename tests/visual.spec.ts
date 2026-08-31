import { test, expect, type ConsoleMessage } from "@playwright/test";
import { mkdirSync } from "node:fs";

/**
 * Not a correctness test suite — a way to actually SEE every route in both
 * themes at two widths instead of asserting things look right. Screenshots
 * land in test-results/visual/ (gitignored); read them with an image-capable
 * tool after a run. Fails the run on any console error, which a screenshot
 * alone won't catch.
 */
const ROUTES = [
  "/",
  "/mitglieder",
  "/mitglied-werden",
  "/veranstaltungen",
  "/veranstaltungen/offenbacher-woche",
  "/verein",
  "/kontakt",
  "/impressum",
  "/datenschutz",
  "/radar",
  "/styleguide",
];

const WIDTHS = [1360, 420];
const THEMES = ["light", "dark"] as const;

const OUT_DIR = "test-results/visual";
mkdirSync(OUT_DIR, { recursive: true });

for (const route of ROUTES) {
  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      test(`${route} — ${theme} — ${width}px`, async ({ page }) => {
        const errors: string[] = [];
        page.on("console", (msg: ConsoleMessage) => {
          if (msg.type() === "error") errors.push(msg.text());
        });
        page.on("pageerror", (err) => errors.push(err.message));

        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: theme });
        const response = await page.goto(route, { waitUntil: "networkidle" });
        expect(response?.status(), `${route} should not error`).toBeLessThan(500);

        // Reveal (components/motion.tsx) fades sections in via IntersectionObserver
        // as the real viewport crosses them. A fullPage screenshot without this
        // step captures sections that never entered the viewport, so they'd show
        // up blank — a screenshot artifact, not a real bug, but one worth not
        // reintroducing into every run.
        const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
        for (let y = 0; y < scrollHeight; y += 700) {
          await page.evaluate((yy) => window.scrollTo(0, yy), y);
          await page.waitForTimeout(120);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(200);

        const safeName = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_");
        await page.screenshot({ path: `${OUT_DIR}/${safeName}__${theme}__${width}.png`, fullPage: true });

        expect(errors, `console errors on ${route} (${theme}, ${width}px):\n${errors.join("\n")}`).toEqual([]);
      });
    }
  }
}
