/**
 * Seed content for the homepage and /veranstaltungen. Only one date in here
 * is actually confirmed: the 2026 Offenbacher Woche ran 28–31 May, its 28th
 * edition — and that's already in the past (see data/verein.ts KENNZAHLEN,
 * where it's stated as history, not a claim about what's next). Nobody has
 * given us a confirmed date for any *upcoming* occurrence of any of these
 * four events, so `isoStart`/`isoEnd` are omitted everywhere below.
 *
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
  tone: "accent" | "river";
};

export const EVENTS: Event[] = [
  {
    slug: "offenbacher-woche",
    title: "Offenbacher Woche",
    when: "Termin für 2027 noch offen",
    place: "Innenstadt",
    summary:
      "Vier Tage Musik, Marktstände und verkaufsoffener Sonntag. 2026 haben wir sie zum 28. Mal ausgerichtet, vom 28. bis 31. Mai — gemeinsam mit dem Einzelhandel der Innenstadt.",
    tone: "accent",
  },
  {
    slug: "lichterfest-buesingpark",
    title: "Lichterfest im Büsingpark",
    when: "Sommer, Termin noch offen",
    place: "Büsingpark",
    summary:
      "Ein Abend im beleuchteten Park, getragen von Vereinen und Sponsoren aus der Stadt. Für Betriebe in der Innenstadt einer der stärksten Abende des Jahres.",
    tone: "river",
  },
  {
    slug: "verkaufsoffene-sonntage",
    title: "Verkaufsoffene Sonntage",
    when: "Mehrmals im Jahr, Termine noch offen",
    place: "Innenstadt",
    summary:
      "Wir beantragen sie, stimmen die Termine ab und bewerben sie gebündelt — damit nicht jeder Betrieb einzeln um Aufmerksamkeit kämpfen muss.",
    tone: "river",
  },
  {
    slug: "weihnachtsbeleuchtung",
    title: "Weihnachtliche Innenstadtbeleuchtung",
    when: "November bis Januar",
    place: "Innenstadt",
    summary:
      "Die Lichter in der Innenstadt hängen nicht von allein. Der Verein organisiert und finanziert sie mit — sichtbar für jeden, der im Advent in die Stadt kommt.",
    tone: "accent",
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

/** First OF-Radar entries — seed data, until the database is wired up. */
export type RadarItem = {
  slug: string;
  category: "rathaus" | "baustelle" | "foerderung" | "frequenz" | "stadt" | "recht";
  headline: string;
  summary: string;
  action: string;
  source: string;
  date: string;
  urgency: "low" | "mid" | "high";
  deadline?: string;
};

export const RADAR_CATEGORIES: Record<
  RadarItem["category"],
  { label: string; tone: "accent" | "river" | "neutral" }
> = {
  rathaus: { label: "Rathaus & Regeln", tone: "accent" },
  baustelle: { label: "Baustellen", tone: "accent" },
  foerderung: { label: "Förderung & Fristen", tone: "accent" },
  frequenz: { label: "Frequenz-Kalender", tone: "river" },
  stadt: { label: "Stadt entwickelt sich", tone: "river" },
  recht: { label: "Recht & Kosten", tone: "neutral" },
};

// TODO-COPY: these are demo entries for judging the layout.
// Real ones come from /api/radar/ingest and go live only after approval
// in /admin/radar — nothing publishes automatically.
export const RADAR_SEED: RadarItem[] = [
  {
    slug: "sondernutzung-aussengastronomie",
    category: "rathaus",
    headline: "Neue Gebührenordnung für Außengastronomie ab dem Frühjahr",
    summary:
      "Die Stadt hat die Sätze für Sondernutzung im öffentlichen Raum neu gefasst. Betroffen sind Tische, Stühle und Warenauslagen auf dem Gehweg.",
    action: "Wer Fläche vor dem Laden nutzt, sollte den Antrag vor Saisonbeginn neu stellen.",
    source: "Stadt Offenbach, Pressemeldung",
    date: "2026-08-27",
    urgency: "mid",
  },
  {
    slug: "frankfurter-strasse-sperrung",
    category: "baustelle",
    headline: "Frankfurter Straße: Teilsperrung über sechs Wochen",
    summary:
      "Wegen Leitungsarbeiten ist ein Abschnitt der Frankfurter Straße nur einspurig befahrbar. Die Zufahrt zu den Geschäften bleibt zu Fuß frei.",
    action: "Betriebe an der Strecke: Lieferzeiten verschieben und Kundschaft aktiv auf die Erreichbarkeit hinweisen.",
    source: "Stadt Offenbach",
    date: "2026-08-25",
    urgency: "high",
  },
  {
    slug: "digitalbonus-hessen",
    category: "foerderung",
    headline: "Digitalbonus Hessen: nächstes Antragsfenster",
    summary:
      "Zuschuss für Digitalisierungsvorhaben kleiner Betriebe. Antragsberechtigt sind Unternehmen mit Sitz oder Betriebsstätte in Hessen.",
    action: "Wer Kasse, Warenwirtschaft oder Shop erneuern will, sollte den Antrag jetzt vorbereiten.",
    source: "WIBank",
    date: "2026-08-20",
    urgency: "mid",
    deadline: "2026-10-31",
  },
  {
    slug: "lichterfest-frequenz",
    category: "frequenz",
    headline: "Lichterfest im Büsingpark: mit hoher Besucherzahl rechnen",
    summary:
      "Der Vorverkauf läuft, Vereine und Sponsoren tragen das Fest mit. Erfahrungsgemäß einer der stärksten Abende des Sommers in der Innenstadt.",
    action: "Personal und Warenbestand für den Abend und den Folgetag entsprechend planen.",
    source: "Stadt Offenbach",
    date: "2026-07-31",
    urgency: "low",
  },
  {
    slug: "kaiserlei-buerobau",
    category: "stadt",
    headline: "Kaiserlei: weiterer Büroneubau bezugsfertig",
    summary:
      "Am Kaiserlei entstehen weiter Büroflächen. Jeder neue Standort dort bedeutet zusätzliche Mittagsgäste und Laufkundschaft für die angrenzende Innenstadt.",
    action: "Mittagsangebot und Öffnungszeiten auf Bürorhythmus prüfen.",
    source: "Stadt Offenbach",
    date: "2026-07-18",
    urgency: "low",
  },
  {
    slug: "e-rechnung-pflicht",
    category: "recht",
    headline: "E-Rechnung: Übergangsfristen laufen weiter aus",
    summary:
      "Im Geschäftsverkehr zwischen Unternehmen gilt die Pflicht zum Empfang elektronischer Rechnungen. Die Fristen für das Versenden sind gestaffelt.",
    action: "Prüfen, ob die eigene Software das Format kann — und wer im Betrieb dafür zuständig ist.",
    source: "IHK Offenbach am Main",
    date: "2026-07-02",
    urgency: "mid",
  },
];
