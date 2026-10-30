import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { buildIcs } from "../lib/ics";
import { entriesOnDate, getCalendarEntries, nextDeadlineOnOrAfter } from "../lib/calendar";
import { formatItemDate, itemSourceDate, validateRadarItem } from "../lib/radar-content";

/**
 * Multi-day OF-Radar items (dateEnd), the Weihnachtsmarkt as the real case:
 * 16.11.–30.12.2026 spans a month boundary (Nov→Dec) and, paged forward, a
 * year boundary. Needs "today" to be inside the browsable range (12 months
 * back) — fine until late 2027, when this data has long since aged out.
 */
const SLUG = "weihnachtsmarkt-16-november-bis-30-dezember";
const HUETTE = "vereinshuette-weihnachtsmarkt-bewerbung-bis-23-oktober";

async function itemJsonLd(page: import("@playwright/test").Page, type: string) {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.map((b) => JSON.parse(b)).find((o) => o["@type"] === type);
}

test.describe("dateEnd: logic", () => {
  test("guard rejects dateEnd without a start, or before it", () => {
    expect(validateRadarItem({ slug: "a", dateEnd: "2026-12-30" })).not.toEqual([]);
    expect(validateRadarItem({ slug: "b", date: "2026-11-16", dateEnd: "2026-11-15" })).not.toEqual([]);
    expect(validateRadarItem({ slug: "c", date: "2026-11-16", dateEnd: "2026-12-30" })).toEqual([]);
    expect(validateRadarItem({ slug: "d", date: "2026-11-16" })).toEqual([]);
  });

  test("ics: DTEND is exclusive — a range ending 30.12. writes 31.12.", () => {
    const ics = buildIcs({ slug: "x", title: "t", summary: "s", isoStart: "2026-11-16", isoEnd: "2026-12-30" });
    expect(ics).toContain("DTSTART;VALUE=DATE:20261116");
    expect(ics).toContain("DTEND;VALUE=DATE:20261231");
    // year boundary: last day 31.12. writes 1.1. of the next year
    const ny = buildIcs({ slug: "y", title: "t", summary: "s", isoStart: "2026-12-30", isoEnd: "2026-12-31" });
    expect(ny).toContain("DTEND;VALUE=DATE:20270101");
    // single day: DTEND is the day after the start
    const one = buildIcs({ slug: "z", title: "t", summary: "s", isoStart: "2026-10-23" });
    expect(one).toContain("DTEND;VALUE=DATE:20261024");
  });

  test("calendar entry covers every day of the range, and only those", () => {
    const entries = getCalendarEntries();
    const has = (iso: string) => entriesOnDate(entries, iso).some((e) => e.key === `radar-${SLUG}`);
    for (const iso of ["2026-11-16", "2026-11-30", "2026-12-01", "2026-12-24", "2026-12-30"]) expect(has(iso), iso).toBe(true);
    for (const iso of ["2026-11-15", "2026-12-31", "2027-01-01", "2027-01-05"]) expect(has(iso), iso).toBe(false);
  });

  test("display helpers", () => {
    expect(formatItemDate({ date: "2026-11-16", dateEnd: "2026-12-30" })).toBe("16.11.–30.12.2026");
    expect(formatItemDate({ date: "2026-12-28", dateEnd: "2027-01-03" })).toBe("28.12.2026–03.01.2027");
    expect(formatItemDate({ date: "2026-10-23" })).toBe("23.10.2026");
    expect(itemSourceDate({ date: "2026-10-23", sourceDate: null })).toBeNull();
    expect(itemSourceDate({ date: "2026-09-06" })).toBe("2026-09-06");
  });
});

test.describe("dateEnd: pages", () => {
  test("ten-day strip marks each day of the range inside the window (month boundary)", async ({ page }) => {
    await page.goto("/radar?ab=2026-11-26"); // 26.11.–05.12.
    const radios = page.getByRole("radio");
    await expect(radios).toHaveCount(10);
    for (let i = 0; i < 10; i++) await expect(radios.nth(i)).toHaveAccessibleName(/, 1 Termin$/);
  });

  test("window straddling the start: marks begin on 16.11. only", async ({ page }) => {
    await page.goto("/radar?ab=2026-11-12"); // 12.–21.11.
    const names = await page.getByRole("radio").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
    expect(names.slice(0, 4).every((n) => !/Termin/.test(n ?? ""))).toBe(true); // 12.–15.
    expect(names.slice(4).every((n) => /, 1 Termin$/.test(n ?? ""))).toBe(true); // 16.–21.
  });

  test("window across the year boundary: marks stop after 30.12., nothing breaks", async ({ page }) => {
    await page.goto("/radar?ab=2026-12-27"); // 27.12.2026–05.01.2027
    const names = await page.getByRole("radio").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
    expect(names).toHaveLength(10);
    expect(names.slice(0, 4).every((n) => /, 1 Termin$/.test(n ?? ""))).toBe(true); // 27.–30.12.
    expect(names.slice(4).every((n) => !/Termin/.test(n ?? ""))).toBe(true); // 31.12.–05.01.
    expect(names[5]).toMatch(/^1\. Januar 2027, Freitag/);
  });

  test("day-strip label leads with the visible number (speech input)", async ({ page }) => {
    await page.goto("/radar?ab=2026-10-23");
    const first = page.getByRole("radio").first();
    await expect(first).toHaveAccessibleName("23. Oktober 2026, Freitag");
    await expect(first).toContainText("23");
  });

  test("detail page: range, Event JSON-LD with startDate and endDate, ics with exclusive end", async ({ page }) => {
    await page.goto(`/radar/${SLUG}`);
    await expect(page.getByRole("main")).toContainText("16.11.–30.12.2026");
    const ld = await itemJsonLd(page, "Event");
    expect(ld).toBeDefined();
    expect(ld.startDate).toBe("2026-11-16");
    expect(ld.endDate).toBe("2026-12-30");
    expect(ld.location.name).toBe("Offenbach am Main"); // nothing inferred beyond the city
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /\.ics/ }).click(),
    ]);
    const ics = readFileSync((await download.path())!, "utf8");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261116");
    expect(ics).toContain("DTEND;VALUE=DATE:20261231");
  });

  test("no publication date: Quelle line has no dangling separator, no datePublished, no pubDate", async ({ page, request }) => {
    for (const slug of [SLUG, HUETTE]) {
      await page.goto(`/radar/${slug}`);
      const quelle = (await page.locator("p", { hasText: /^Quelle:/ }).first().innerText()).replace(/\s+/g, " ").trim();
      expect(quelle.toUpperCase()).toBe("QUELLE: STADT OFFENBACH (OFFENBACH.DE)");
      const ld = await itemJsonLd(page, slug === SLUG ? "Event" : "Article");
      expect(ld, slug).toBeDefined();
      expect(ld.datePublished).toBeUndefined();
    }
    const xml = await (await request.get("/radar/feed.xml")).text();
    // The feed only lists items that are still current: the Weihnachtsmarkt runs to 30.12.2026;
    // the Vereinshütte item drops out after its 23.10.2026 deadline. Whatever IS listed has no pubDate.
    const chunks = xml.split("<item>").slice(1);
    const weihnachtsmarkt = chunks.find((chunk) => chunk.includes(`/radar/${SLUG}`));
    expect(weihnachtsmarkt, "Weihnachtsmarkt is in the feed").toBeDefined();
    for (const slug of [SLUG, HUETTE]) {
      const item = chunks.find((chunk) => chunk.includes(`/radar/${slug}`));
      if (item) expect(item, slug).not.toContain("<pubDate>");
    }
  });

  test("deadline item displays the deadline as its date", async ({ page }) => {
    await page.goto(`/radar/${HUETTE}`);
    await expect(page.locator("time").first()).toHaveAttribute("datetime", "2026-10-23");
    await expect(page.getByRole("main")).toContainText("23.10.2026");
  });
});

test.describe("empty strip names the nearest Frist and the next Termin", () => {
  test("nextDeadlineOnOrAfter picks the soonest open deadline", () => {
    const list = [
      { iso: "2026-10-23", title: "A", href: "/radar/a" },
      { iso: "2026-12-01", title: "B", href: "/radar/b" },
    ];
    expect(nextDeadlineOnOrAfter(list, "2026-10-11")?.title).toBe("A");
    expect(nextDeadlineOnOrAfter(list, "2026-10-23")?.title).toBe("A");
    expect(nextDeadlineOnOrAfter(list, "2026-10-24")?.title).toBe("B");
    expect(nextDeadlineOnOrAfter(list, "2026-12-02")).toBeUndefined();
  });

  test("server-rendered (no JavaScript): Frist first, then Termin, both linked", async ({ browser }) => {
    // The deadline item drops off the list after 23.10.2026; the assertion only makes sense until then.
    test.skip(new Date() > new Date("2026-10-23T22:00:00Z"), "deadline has passed");
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    // The default window starts today (Berlin) — "In den nächsten zehn Tagen" only reads that way then.
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date());
    await page.goto(`/radar?ab=${today}`);
    const panel = page.locator("p", { hasText: "ist nichts eingetragen" }).first();
    const text = (await panel.innerText()).replace(/\s+/g, " ");
    expect(text).toMatch(/^In den nächsten zehn Tagen ist nichts eingetragen\.|^Keine Termine vom/);
    const frist = text.indexOf("Nächste Frist: 23.10.2026 — Vereinshütte auf dem Weihnachtsmarkt: Bewerbung bis 23. Oktober.");
    const termin = text.indexOf("Nächster Termin: 16.11.2026 — Weihnachtsmarkt: Die Stadt nennt den 16. November bis 30. Dezember.");
    expect(frist, text).toBeGreaterThan(-1);
    expect(termin, text).toBeGreaterThan(frist);
    await expect(panel.getByRole("link")).toHaveCount(2);
    await ctx.close();
  });

  test("window with no Frist ahead: only the Termin line", async ({ page }) => {
    // From 12.11.2026 on no deadline exists in the data, but the Weihnachtsmarkt starts 16.11.
    await page.goto("/radar?ab=2026-11-01");
    const panel = page.locator("p", { hasText: "Keine Termine" }).first();
    await expect(panel).toContainText("Nächster Termin: 16.11.2026");
    await expect(panel).not.toContainText("Nächste Frist");
  });
});
