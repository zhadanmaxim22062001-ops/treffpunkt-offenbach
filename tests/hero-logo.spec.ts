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
  [1100, 700], [1279, 800], [1280, 720], [1280, 800], [1360, 900], [1440, 1080], [1520, 824], [1920, 1080], [2560, 1440],
];

/**
 * The layout rules from globals.css (.hero-logo-box), written out here on
 * purpose and not read back from the CSS, so a CSS change has to be a
 * deliberate change to this test too:
 *   width          the smaller of clamp(320px, 26% of the hero, 460px) and the
 *                  room beside the text
 *   right edge     the T's right edge sits min(hero - 48px, content gutter +
 *                  160px) from 1280px, hero - 24px below (the margin from the
 *                  viewport edge is therefore max(48, edge - 136) / 24)
 *   text gap       48px from 1280px, 32px below — measured to the real glyph
 *                  extent of headline, lead and buttons
 *   centre         86% of the hero's height, unless that would put the logo's
 *                  bottom edge within 24px of the hero's bottom
 */
function rules(viewportWidth: number, heroWidth: number) {
  const wide = viewportWidth >= 1280;
  const gap = wide ? 48 : 32;
  const edge = (heroWidth - Math.min(heroWidth, 1180)) / 2;
  const margin = wide ? Math.max(48, edge - 136) : 24;
  const room = heroWidth - margin - edge - 543 - gap;
  const target = Math.min(460, Math.max(320, 0.26 * heroWidth));
  return { widthPx: Math.min(target, room), margin, gap };
}

for (const [w, h] of SIZES) {
  test(`hero logo: small, anchored to the photo's edge, centred at 86%, whole, clear of the text: ${w}x${h}`, async ({ page }) => {
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
      return {
        heroW: H.width,
        heroH: H.height,
        widthPx: S.width,
        heightPx: S.height,
        gapToText: S.left - Math.max(...rights),
        rightEdgeFromViewport: H.right - S.right,
        lastGlyphMargin: H.right - L.right,
        centrePct: ((S.top + S.height * 0.5 - H.top) / H.height) * 100,
        bottomClear: H.bottom - S.bottom,
        lettersInside: L.left >= H.left && L.right <= H.right && L.top >= H.top && L.bottom <= H.bottom,
      };
    });
    const x = rules(w, r.heroW);
    expect(r.lettersInside, "(a) no letter cut by the viewport or the hero").toBe(true);
    expect(r.lastGlyphMargin, "(a) >=16px clear margin right of the last glyph").toBeGreaterThanOrEqual(16);
    expect(Math.abs(r.widthPx - x.widthPx), "width = clamp(320, 26%, 460) or the room beside the text").toBeLessThan(1.5);
    expect(Math.abs(r.rightEdgeFromViewport - x.margin), "right edge anchored toward the photo edge").toBeLessThan(1);
    const expectedCentre = Math.min(86, ((r.heroH - 24 - r.heightPx / 2) / r.heroH) * 100);
    expect(Math.abs(r.centrePct - expectedCentre), "vertical centre 86%, bottom edge held 24px up").toBeLessThan(0.6);
    expect(r.bottomClear, "bottom edge >=24px above the hero's bottom").toBeGreaterThanOrEqual(24 - 0.5);
    expect(r.gapToText, "(b) clear space to headline, lead and buttons").toBeGreaterThanOrEqual(x.gap);
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
