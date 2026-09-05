/**
 * Seed content for the homepage and /veranstaltungen. Only one date in here
 * is actually confirmed: the 2026 Offenbacher Woche, 28–31 May, its 28th
 * edition (see data/verein.ts KENNZAHLEN, where it's stated as history) —
 * carried below as isoStart/isoEnd since it's a real, already-public fact,
 * not a guess, and the OF-Radar day row needs at least one genuine
 * multi-day entry to browse back to. It's already in the past as of any
 * "today" this site runs against from autumn 2026 onward, which is exactly
 * why `when` still separately says the *next* occurrence (2027) is unconfirmed
 * — isoStart/isoEnd describe which date already happened, not a claim about
 * what's next. `getNextConfirmedEvent()` (lib/events.ts) only ever considers
 * a future isoStart, so a past one here doesn't make it show up as "next."
 *
 * Nobody has given us a confirmed date for any *upcoming* occurrence of any
 * of these four events, so isoStart/isoEnd stay omitted everywhere else.
 * Leave them omitted until a real board-confirmed date exists. lib/events.ts
 * treats an event without isoStart as dateless: no Event JSON-LD (schema.org
 * requires startDate, and a guessed one would be worse than none), no .ics
 * download, and the card/detail page describe the event without asserting a
 * date. A wrong date in someone's calendar or in Google's event results is
 * worse than an honest "Termin noch offen."
 */

export type Event = {
  slug: string;
  title: string;
  when: string;
  /** ISO date (YYYY-MM-DD), only ever set once the board has confirmed it. Omitted = date unknown. */
  isoStart?: string;
  /** For multi-day events; also only set once confirmed. */
  isoEnd?: string;
  place: string;
  summary: string;
};

export const EVENTS: Event[] = [
  {
    slug: "offenbacher-woche",
    title: "Offenbacher Woche",
    when: "Termin für 2027 noch offen",
    // The 2026 edition's real, already-public dates — see the file-level
    // comment above for why this is recorded despite being in the past.
    isoStart: "2026-05-28",
    isoEnd: "2026-05-31",
    place: "Innenstadt",
    summary:
      "Vier Tage Musik, Marktstände und verkaufsoffener Sonntag. 2026 haben wir sie zum 28. Mal ausgerichtet, vom 28. bis 31. Mai — gemeinsam mit dem Einzelhandel der Innenstadt.",
  },
  {
    slug: "lichterfest-buesingpark",
    title: "Lichterfest im Büsingpark",
    when: "Sommer, Termin noch offen",
    place: "Büsingpark",
    summary:
      "Ein Abend im beleuchteten Park, getragen von Vereinen und Sponsoren aus der Stadt. Für Betriebe in der Innenstadt einer der stärksten Abende des Jahres.",
  },
  {
    slug: "verkaufsoffene-sonntage",
    title: "Verkaufsoffene Sonntage",
    when: "Mehrmals im Jahr, Termine noch offen",
    place: "Innenstadt",
    summary:
      "Wir beantragen sie, stimmen die Termine ab und bewerben sie gebündelt — damit nicht jeder Betrieb einzeln um Aufmerksamkeit kämpfen muss.",
  },
  {
    slug: "weihnachtsbeleuchtung",
    title: "Weihnachtliche Innenstadtbeleuchtung",
    when: "November bis Januar",
    place: "Innenstadt",
    summary:
      "Die Lichter in der Innenstadt hängen nicht von allein. Der Verein organisiert und finanziert sie mit — sichtbar für jeden, der im Advent in die Stadt kommt.",
  },
];

export type Leistung = { title: string; body: string };

export const LEISTUNGEN: Leistung[] = [
  {
    title: "Innenstadt beleben",
    body: "Wir richten die Formate aus, die Menschen in die Stadt holen: Offenbacher Woche, Lichterfest, verkaufsoffene Sonntage, Weihnachtsbeleuchtung. Frequenz entsteht nicht von selbst.",
  },
  {
    title: "Netzwerk statt Einzelkampf",
    body: "Über hundert Betriebe, die dieselben Straßen teilen. Wer seine Nachbarn kennt, findet schneller einen Handwerker, einen Nachmieter oder jemanden, der dasselbe Problem schon gelöst hat.",
  },
  {
    title: "Interessen vertreten",
    body: "Sondernutzung, Ladenöffnung, Baustellen, Gestaltungssatzung: Entscheidungen im Rathaus treffen Betriebe direkt. Als Verein sitzen wir früher am Tisch als jeder Einzelne.",
  },
];

// OF-Radar content moved to data/radar.json + lib/radar-content.ts (v1 is
// file-based, no database — see README's OF-Radar section).
