import { test, expect } from "@playwright/test";

/**
 * THE GATE for the hero logo over the photograph: the share of letter pixels
 * under 3:1 contrast, measured against the BARE photo (no logo, no glow), must
 * stay <= 1% at every tested width. Fail it and stop.
 *
 * Informational only — logged, never asserted on, never compensated for:
 * the median, the single-pixel worst case, and the glow-aware share (about 3%,
 * because the F and P cross the pale halo, which is the artwork).
 *
 * 1520x824 (a 1920x1080 screen at 125% scaling) and 1280x720 (at 150%) are
 * mandatory: they are what real visitors have.
 *
 * Method: the white letters (#F2F6F9) are found by diffing a screenshot with
 * the logo against one without it, then each letter pixel is compared with the
 * bare photo pixel beneath it (WCAG contrast ratio).
 */
const SIZES: [number, number][] = [[1024, 768], [1280, 720], [1280, 800], [1360, 900], [1440, 1080], [1520, 824], [1920, 1080]];

for (const [w, h] of SIZES) {
  test(`GATE: <=1% of the hero logo's letter pixels under 3:1 against the BARE photo: ${w}x${h}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    await page.waitForTimeout(1500);
    await page.evaluate(() => ((document.querySelector(".hero-logo") as HTMLElement).style.display = "none"));
    await page.waitForTimeout(300);
    const bare = await page.screenshot();
    await page.evaluate(() => ((document.querySelector(".hero-logo") as HTMLElement).style.display = ""));
    await page.waitForTimeout(300);
    const withLogo = await page.screenshot();
    const r = await page.evaluate(
      async ({ a, v }) => {
        const lum = (r: number, g: number, b: number) => {
          const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const load = async (b64: string) => {
          const img = new Image();
          img.src = "data:image/png;base64," + b64;
          await img.decode();
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = img.height;
          const ctx = c.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          return ctx.getImageData(0, 0, img.width, img.height).data;
        };
        const A = await load(a), V = await load(v);
        const white = lum(0xf2, 0xf6, 0xf9);
        const ratios: number[] = [];
        for (let k = 0; k < V.length; k += 4) {
          const isLetter = Math.abs(V[k] - 0xf2) < 6 && Math.abs(V[k + 1] - 0xf6) < 6 && Math.abs(V[k + 2] - 0xf9) < 6;
          const sameAsBare = Math.abs(A[k] - V[k]) < 6 && Math.abs(A[k + 1] - V[k + 1]) < 6 && Math.abs(A[k + 2] - V[k + 2]) < 6;
          if (isLetter && !sameAsBare) ratios.push((white + 0.05) / (lum(A[k], A[k + 1], A[k + 2]) + 0.05));
        }
        ratios.sort((x, y) => x - y);
        return { n: ratios.length, under3: ratios.filter((c) => c < 3).length, median: ratios[Math.floor(ratios.length / 2)], worst: ratios[0] };
      },
      { a: bare.toString("base64"), v: withLogo.toString("base64") },
    );
    expect(r.n, "found the letters").toBeGreaterThan(1000);
    const share = (r.under3 / r.n) * 100;
    console.log(`[hero contrast ${w}x${h}] under 3:1 ${share.toFixed(2)}% | median ${r.median.toFixed(2)} (info) | worst pixel ${r.worst.toFixed(2)} (info)`);
    expect(share).toBeLessThanOrEqual(1);
  });
}
