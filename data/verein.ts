/**
 * Real association data, taken from treffpunkt-offenbach.com (Impressum, Vorstand).
 * Anything not found there is marked TODO — never invented.
 */

export const VEREIN = {
  name: "Gewerbeverein Treffpunkt Offenbach e. V.",
  shortName: "Treffpunkt Offenbach",
  street: "Frankfurter Str. 7",
  addressNote: "im Hause M. Schneider",
  zip: "63065",
  city: "Offenbach am Main",
  phone: "0160 92240226",
  email: "info@treffpunkt-offenbach.com",
  responsible: "Klaus Kohlweyer",
  // TODO-COPY: Vereinsregister number and founding year — ask the board
  registerNumber: null as string | null,
  foundedYear: null as number | null,
};

/**
 * The current board, in the association's own order. Deliberately just
 * names — no `role` field. The board changed and we were given the new
 * roster without office assignments; inventing "1. Vorsitzender" etc. next
 * to a name nobody confirmed would be worse than the plain list. If/when
 * the board confirms who holds which office, add a `role` field back then,
 * filled in for every entry — not a mix of real and guessed roles.
 */
export const VORSTAND: string[] = [
  "Petra Klein",
  "Andy Hymmer",
  "Roland Nowak",
  "Birgitt Möbus",
  "Ursula Ölcer",
  "Matthias Roth",
  "Mark Pegels",
];

export const KENNZAHLEN = [
  // TODO-COPY: ask the board for the exact member count
  { value: 100, suffix: "+", label: "Mitgliedsbetriebe", note: "Handel, Gastronomie, Handwerk, Dienstleistung" },
  { value: 28, suffix: ".", label: "Offenbacher Woche", note: "2026 zum 28. Mal, vom 28. bis 31. Mai" },
  { value: 4, suffix: "", label: "Große Formate im Jahr", note: "OF-Woche, Lichterfest, offene Sonntage, Beleuchtung" },
  { value: 6, suffix: "", label: "Rubriken im OF-Radar", note: "gefiltert auf das, was Betriebe betrifft" },
];
