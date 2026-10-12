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
  [1280, 720], [1280, 800], [1360, 900], [1440, 1080], [1920, 1080],
];

for (const [w, h] of SIZES) {
  test(`hero logo: whole, inside the hero, clear of headline/lead/buttons: ${w}x${h}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => {
      const hero = [...document.querySelectorAll("header")].pop()!;
      const svg = hero.querySelector(".hero-logo svg")!;
      const rect = (e: Element) => e.getBoundingClientRect();
      const H = rect(hero), L = rect(svg.querySelector("g[fill]")!), box = rect(svg);
      const h1 = hero.querySelector("h1")!;
      const text = [h1, ...h1.parentElement!.querySelectorAll("p"), ...hero.querySelectorAll("a")].map(rect);
      const gap = (A: DOMRect) =>
        Math.min(...text.map((t) => Math.hypot(Math.max(A.left - t.right, t.left - A.right, 0), Math.max(A.top - t.bottom, t.top - A.bottom, 0))));
      return {
        lettersInside: L.left >= H.left && L.right <= H.right && L.top >= H.top && L.bottom <= H.bottom,
        boxGap: gap(box),
        letterGap: gap(L),
        widthPct: (box.width / H.width) * 100,
      };
    });
    expect(r.lettersInside).toBe(true);
    expect(r.boxGap).toBeGreaterThan(20); // the pale halo box never touches the text
    expect(r.letterGap).toBeGreaterThan(20);
    expect(r.widthPct).toBeGreaterThan(33);
    expect(r.widthPct).toBeLessThan(41);
  });
}

test("hidden below 768px", async ({ page }) => {
  await page.setViewportSize({ width: 767, height: 900 });
  await page.goto("/");
  await expect(page.locator(".hero-logo")).toBeHidden();
});

test("the dot breathes (scale 1 -> 1.035, 3.6s, transform only), letters and layout stay still", async ({ page }) => {
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
  expect(cs).toMatchObject({ name: "dot-pulse", dur: "3.6s", iter: "infinite", ease: "ease-in-out", wc: "transform", filter: "none", opacity: "1" });
  const samples: { d: number; cx: number; lx: number }[] = [];
  for (let i = 0; i < 24; i++) {
    samples.push(
      await page.evaluate(() => {
        const c = document.querySelectorAll(".hero-logo .tpof-dot circle")[1].getBoundingClientRect();
        const L = document.querySelector(".hero-logo svg g[fill]")!.getBoundingClientRect();
        return { d: c.width, cx: c.left + c.width / 2, lx: L.left };
      }),
    );
    await page.waitForTimeout(150);
  }
  const d = samples.map((s) => s.d);
  expect(Math.max(...d) / Math.min(...d)).toBeGreaterThan(1.03);
  expect(Math.max(...d) / Math.min(...d)).toBeLessThan(1.04);
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
