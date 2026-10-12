import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { HERO_LOGO_SVG } from "../lib/hero-logo-svg.generated";

/**
 * The hero logo (TREFF ● PUNKT, inlined so the dot can pulse): the inlined
 * copy is the file, the words stay whole and clear of the text, the dot
 * breathes only when motion is allowed, nothing shifts, and a reduced-motion
 * visitor still gets the headline.
 */
test("inlined hero logo is a byte copy of public/brand/logo-compact-inverse.svg", () => {
  expect(HERO_LOGO_SVG).toBe(readFileSync("public/brand/logo-compact-inverse.svg", "utf8"));
});

test("inlined copy: no duplicate ids in the document, and the glow under the letters survives inlining", async ({ page }) => {
  await page.setViewportSize({ width: 1360, height: 900 });
  await page.goto("/");
  const r = await page.evaluate(() => {
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
    const svg = document.querySelector(".hero-logo svg")!;
    const filters = [...svg.querySelectorAll("g[filter]")].map((g) => getComputedStyle(g).filter);
    const target = svg.querySelector("g[filter]")?.getAttribute("filter")?.match(/url\(#([^)]+)\)/)?.[1];
    return {
      dups: ids.filter((x, i) => ids.indexOf(x) !== i),
      filters,
      filterDefined: !!target && document.querySelectorAll(`filter[id="${target}"]`).length === 1,
      dropShadow: !!target && !!document.getElementById(target)?.querySelector("feDropShadow"),
    };
  });
  expect(r.dups).toEqual([]);
  expect(r.filters.length).toBeGreaterThan(0);
  expect(r.filters.every((f) => f.startsWith("url("))).toBe(true);
  expect(r.filterDefined).toBe(true);
  expect(r.dropShadow).toBe(true);
});

const SIZES: [number, number][] = [
  [768, 1024], [768, 700], [800, 600], [860, 600], [900, 600], [900, 700], [1024, 600], [1024, 768],
  [1100, 700], [1279, 800], [1280, 720], [1280, 800], [1360, 900], [1440, 1080], [1920, 1080], [2560, 1440],
];

/**
 * The expected width, derived from the rule in globals.css (.hero-logo-box):
 * the target percentage of the hero's width, or the room left beside the text
 * column inside the 1180px container — whichever is smaller. Written out here
 * on purpose, not read back from the CSS, so a CSS change has to be a
 * deliberate change to this test too.
 */
function expectedWidthPct(viewportWidth: number, heroWidth: number): number {
  if (viewportWidth >= 1280) return Math.min(44, ((Math.min(heroWidth, 1180) - 614) / heroWidth) * 100);
  if (viewportWidth >= 1024) return Math.min(38, ((heroWidth - 598) / heroWidth) * 100);
  return Math.min(34, ((heroWidth - 598) / heroWidth) * 100);
}

for (const [w, h] of SIZES) {
  test(`hero logo: aligned to the gutter, level with the lead, whole, clear of the text: ${w}x${h}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => {
      const hero = [...document.querySelectorAll("header")].pop()!;
      const svg = hero.querySelector(".hero-logo svg")!;
      const H = hero.getBoundingClientRect(), S = svg.getBoundingClientRect(), L = svg.querySelector("g[fill]")!.getBoundingClientRect();
      // The real glyph boxes of the headline and lead lines, plus both buttons.
      const rights: number[] = [];
      const addText = (el: Element) => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          if (!n.textContent?.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(n);
          for (const q of Array.from(range.getClientRects())) if (q.width > 1 && q.height > 1) rights.push(q.right);
        }
      };
      const h1 = hero.querySelector("h1")!;
      addText(h1);
      h1.parentElement!.querySelectorAll("p").forEach(addText);
      hero.querySelectorAll("a").forEach((a) => rights.push(a.getBoundingClientRect().right));
      const gutter = hero.querySelector(".hero-logo-slot > div")!.getBoundingClientRect();
      return {
        heroW: H.width,
        widthPct: (S.width / H.width) * 100,
        gapToText: S.left - Math.max(...rights),
        rightEdgeOffset: S.right - (gutter.right - 24),
        centrePct: ((S.top + S.height * 0.5 - H.top) / H.height) * 100,
        lettersInside: L.left >= H.left && L.right <= H.right && L.top >= H.top && L.bottom <= H.bottom,
      };
    });
    expect(r.lettersInside, "(a) no letter cut by the viewport or the hero").toBe(true);
    expect(Math.abs(r.rightEdgeOffset), "right edge on the content gutter").toBeLessThan(1);
    expect(Math.abs(r.centrePct - 72), "vertical centre at 72% of the hero").toBeLessThan(1);
    expect(Math.abs(r.widthPct - expectedWidthPct(w, r.heroW)), "width = target % or the room beside the text").toBeLessThan(0.3);
    // (b) clear space between the logo's left edge and the right edge of headline, lead and buttons
    expect(r.gapToText, "(b) clear space").toBeGreaterThanOrEqual(w >= 1280 ? 48 : 32);
  });
}

test("hidden below 768px", async ({ page }) => {
  await page.setViewportSize({ width: 767, height: 900 });
  await page.goto("/");
  await expect(page.locator(".hero-logo")).toBeHidden();
});

test("the dot breathes (scale 1 -> 1.07, halo .86 -> 1, 3s, transform and opacity only), letters and layout stay still", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries() as PerformanceEntry[] & { value: number; hadRecentInput: boolean }[]) {
        if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.setViewportSize({ width: 1360, height: 900 });
  await page.goto("/");
  await page.waitForTimeout(1200);
  const g = page.locator(".hero-logo .tpof-dot");
  const cs = await g.evaluate((e) => {
    const s = getComputedStyle(e);
    return { name: s.animationName, dur: s.animationDuration, iter: s.animationIterationCount, ease: s.animationTimingFunction, wc: s.willChange, filter: s.filter, opacity: s.opacity };
  });
  expect(cs).toMatchObject({ name: "dot-pulse", dur: "3s", iter: "infinite", ease: "ease-in-out", wc: "transform", filter: "none", opacity: "1" });
  // the halo breathes in phase: same duration, easing and iteration; opacity only, nothing else added
  const halo = await page.locator(".hero-logo .tpof-halo").evaluate((e) => {
    const s = getComputedStyle(e);
    return { name: s.animationName, dur: s.animationDuration, iter: s.animationIterationCount, ease: s.animationTimingFunction, wc: s.willChange, filter: s.filter };
  });
  expect(halo).toMatchObject({ name: "halo-pulse", dur: "3s", iter: "infinite", ease: "ease-in-out", wc: "auto", filter: "none" });
  const samples: { d: number; cx: number; lx: number; op: number }[] = [];
  for (let i = 0; i < 24; i++) {
    samples.push(
      await page.evaluate(() => {
        const c = document.querySelector(".hero-logo .tpof-dot circle:last-child")!.getBoundingClientRect(); // the core
        const L = document.querySelector(".hero-logo svg g[fill]")!.getBoundingClientRect();
        const op = Number(getComputedStyle(document.querySelector(".hero-logo .tpof-halo")!).opacity);
        return { d: c.width, cx: c.left + c.width / 2, lx: L.left, op };
      }),
    );
    await page.waitForTimeout(150);
  }
  const d = samples.map((s) => s.d);
  expect(Math.max(...d) / Math.min(...d)).toBeGreaterThan(1.06);
  expect(Math.max(...d) / Math.min(...d)).toBeLessThan(1.075);
  const ops = samples.map((s) => s.op);
  expect(Math.min(...ops)).toBeGreaterThan(0.85); // rests at .86, never dips below
  expect(Math.min(...ops)).toBeLessThan(0.88);
  expect(Math.max(...ops)).toBeGreaterThan(0.98); // brightens to 1
  expect(Math.max(...ops)).toBeLessThanOrEqual(1);
  expect(Math.max(...samples.map((s) => s.cx)) - Math.min(...samples.map((s) => s.cx))).toBeLessThan(0.5); // scales about its centre
  expect(new Set(samples.map((s) => s.lx)).size).toBe(1); // letters never move
  expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBe(0);
});

test.describe("reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("no pulse at all, the dot sits at scale 1", async ({ page }) => {
    await page.setViewportSize({ width: 1360, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(800);
    await expect(page.locator(".hero-logo .tpof-dot")).toHaveCSS("animation-name", "none");
    await expect(page.locator(".hero-logo .tpof-halo")).toHaveCSS("animation-name", "none");
    await expect(page.locator(".hero-logo .tpof-halo")).toHaveCSS("opacity", "0.86"); // resting value
    await expect(page.locator(".hero-logo")).toHaveCSS("animation-name", "none");
  });

  test("the hero headline is visible (not stuck out of its mask)", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.setViewportSize({ width: 1360, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(1500);
    const transforms = await page.evaluate(() =>
      [...document.querySelectorAll("h1 span.block:not(.overflow-hidden)")].map((e) => getComputedStyle(e).transform),
    );
    expect(transforms.length).toBeGreaterThan(0);
    expect(transforms.every((t) => t === "none")).toBe(true);
    expect(errors.filter((e) => /hydrat/i.test(e))).toEqual([]);
  });
});
