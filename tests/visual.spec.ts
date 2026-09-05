import { test, expect, type ConsoleMessage } from "@playwright/test";
import { mkdirSync } from "node:fs";

/**
 * A bug-sweep pass, not just a way to SEE every route: every route in both
 * themes at four widths, failing on any console error or warning, any
 * horizontal overflow, and any <img> missing explicit dimensions (a classic
 * layout-shift cause). Screenshots land in test-results/visual/ (gitignored)
 * for a human to actually look at afterward — a passing run only proves
 * nothing crashed and nothing shifted, not that the layout looks right.
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
  "/radar/21-kuenstlermarkt-auf-dem-wilhelmsplatz",
  "/radar/gefuehrte-textwanderung-durch-die-frankfurter-strasse",
  "/radar/gestaltungsbeirat-tagt-erst-wieder-im-dezember",
  "/radar/ihk-aktion-heimat-shoppen-im-september",
  "/styleguide",
];

const WIDTHS = [420, 768, 1024, 1360];
const THEMES = ["light", "dark"] as const;

// The no-cookie-banner premise depends on this being true: nothing on the
// site should ever call out to a third party (fonts, analytics, map tiles,
// anything). localhost/127.0.0.1 is the dev/test server itself.
function isThirdParty(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host !== "localhost" && host !== "127.0.0.1";
  } catch {
    return false;
  }
}

const OUT_DIR = "test-results/visual";
mkdirSync(OUT_DIR, { recursive: true });

for (const route of ROUTES) {
  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      test(`${route} — ${theme} — ${width}px`, async ({ page }) => {
        const consoleIssues: string[] = [];
        page.on("console", (msg: ConsoleMessage) => {
          if (msg.type() === "error" || msg.type() === "warning") {
            consoleIssues.push(`[${msg.type()}] ${msg.text()}`);
          }
        });
        page.on("pageerror", (err) => consoleIssues.push(`[pageerror] ${err.message}`));

        const thirdPartyRequests: string[] = [];
        page.on("request", (req) => {
          if (isThirdParty(req.url())) thirdPartyRequests.push(req.url());
        });

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
        await page.waitForTimeout(400);

        // Horizontal overflow: the page itself should never need to scroll
        // sideways at any of these widths.
        const overflow = await page.evaluate(() => {
          const docWidth = document.documentElement.scrollWidth;
          const viewportWidth = window.innerWidth;
          if (docWidth <= viewportWidth) return null;
          // Find the worst offender(s) to make the failure actionable.
          const offenders: string[] = [];
          document.querySelectorAll("body *").forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.right > viewportWidth + 1 || r.left < -1) {
              offenders.push(`${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).split(" ")[0] : ""} (right:${Math.round(r.right)})`);
            }
          });
          return { docWidth, viewportWidth, offenders: offenders.slice(0, 5) };
        });
        expect(overflow, `horizontal overflow on ${route} (${theme}, ${width}px): ${JSON.stringify(overflow)}`).toBeNull();

        // Images without explicit dimensions are a classic CLS cause — every
        // <img> should carry width/height attributes (next/image's default
        // mode always sets these), OR use next/image's `fill` pattern, which
        // deliberately omits them and instead sizes via CSS (position:
        // absolute + inset:0) inside a parent that already has an explicit
        // size — shift-safe as long as that parent size doesn't itself
        // depend on the image loading, which is the actual thing to catch.
        const undimensionedImages = await page.evaluate(() => {
          return [...document.querySelectorAll("img")]
            .filter((img) => {
              if (img.hasAttribute("width") && img.hasAttribute("height")) return false;
              const cs = getComputedStyle(img);
              const isFillPattern = cs.position === "absolute" && cs.inset === "0px";
              return !isFillPattern;
            })
            .map((img) => img.src);
        });
        expect(undimensionedImages, `<img> without explicit dimensions on ${route} (${theme}, ${width}px)`).toEqual([]);

        const safeName = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_");
        await page.screenshot({ path: `${OUT_DIR}/${safeName}__${theme}__${width}.png`, fullPage: true });

        expect(consoleIssues, `console issues on ${route} (${theme}, ${width}px):\n${consoleIssues.join("\n")}`).toEqual([]);
        expect(thirdPartyRequests, `third-party requests on ${route} (${theme}, ${width}px):\n${thirdPartyRequests.join("\n")}`).toEqual([]);
      });
    }
  }
}
