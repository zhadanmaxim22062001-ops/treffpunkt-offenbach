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

// Roles verbatim from treffpunkt-of.de — "Kassierer" and "Schriftführer
// stellv.", not the "Kassenwart"/"stellv. Schriftführer" this used to say.
export const VORSTAND = [
  { name: "Stefan Becker", role: "1. Vorsitzender" },
  { name: "Klaus Kohlweyer", role: "2. Vorsitzender" },
  { name: "Tobias Allmeroth", role: "Kassierer" },
  { name: "Jürgen Proske", role: "Schriftführer" },
  { name: "Roland Nowak", role: "Schriftführer stellv." },
  { name: "Birgitt Möbus", role: "Beisitzerin" },
  { name: "Ursula Ölcer", role: "Beisitzerin" },
  { name: "Matthias Roth", role: "Beisitzer" },
  { name: "Günther Rösler", role: "Beisitzer" },
];

export const KENNZAHLEN = [
  // TODO-COPY: ask the board for the exact member count
  { value: 100, suffix: "+", label: "Mitgliedsbetriebe", note: "Handel, Gastronomie, Handwerk, Dienstleistung" },
  { value: 28, suffix: ".", label: "Offenbacher Woche", note: "2026 zum 28. Mal, vom 28. bis 31. Mai" },
  { value: 4, suffix: "", label: "Große Formate im Jahr", note: "OF-Woche, Lichterfest, offene Sonntage, Beleuchtung" },
  { value: 6, suffix: "", label: "Rubriken im OF-Radar", note: "gefiltert auf das, was Betriebe betrifft" },
];
