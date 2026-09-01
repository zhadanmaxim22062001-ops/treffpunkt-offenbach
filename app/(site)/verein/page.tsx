import type { Metadata } from "next";
import { Eyebrow, Heading, Lead, Section } from "@/components/ui";
import { VEREIN, VORSTAND } from "@/data/verein";

export const metadata: Metadata = {
  title: "Der Verein",
  description: "Der Vorstand des Gewerbevereins Treffpunkt Offenbach e. V. und wofür der Verein steht.",
};

export default function Page() {
  return (
    <>
      <Section>
        <Eyebrow className="mb-4">Der Verein</Eyebrow>
        <Heading level={1} className="max-w-[20ch]">
          Wer wir sind.
        </Heading>
        <Lead className="mt-6 max-w-[60ch]">
          {VEREIN.name} vertritt die Interessen von über hundert Betrieben in der Offenbacher Innenstadt — Handel,
          Gastronomie, Handwerk, Dienstleistung. Wir richten die Formate aus, die Menschen in die Stadt holen, und
          sitzen als Verein früher am Tisch als jeder Einzelne, wenn Entscheidungen im Rathaus Betriebe betreffen.
        </Lead>
      </Section>

      <Section tone="paper-2">
        <Eyebrow className="mb-6">Vorstand</Eyebrow>
        <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {VORSTAND.map((v) => (
            <li key={v.name} className="border-t pt-4" style={{ borderColor: "var(--c-line)" }}>
              <p className="font-display text-[16px] font-semibold">{v.name}</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">{v.role}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <Eyebrow className="mb-4">Kontakt zum Verein</Eyebrow>
        <address className="not-italic text-[15px] leading-relaxed text-ink-2">
          {VEREIN.street}
          {VEREIN.addressNote && (
            <>
              <br />
              {VEREIN.addressNote}
            </>
          )}
          <br />
          {VEREIN.zip} {VEREIN.city}
          <br />
          <a className="link-underline" href={`tel:${VEREIN.phone.replace(/\s/g, "")}`}>
            {VEREIN.phone}
          </a>
          <br />
          <a className="link-underline" href={`mailto:${VEREIN.email}`}>
            {VEREIN.email}
          </a>
        </address>
        <p className="mt-8 font-mono text-[12px] text-muted">
          TODO-COPY: Satzung und eine ausführlichere Vereinsgeschichte stellen wir hier bereit, sobald sie uns
          vorliegen.
        </p>
      </Section>
    </>
  );
}
