import Link from "next/link";
import type { Metadata } from "next";
import { Eyebrow, Heading, Lead, Section } from "@/components/ui";
import { VEREIN, VORSTAND } from "@/data/verein";

export const metadata: Metadata = {
  title: "Der Verein",
  description: "Der Vorstand des Gewerbevereins Treffpunkt Offenbach e. V. und wofür der Verein steht.",
};

const vorsitzende = VORSTAND.filter((v) => v.role.includes("Vorsitzende"));
const kasseSchrift = VORSTAND.filter((v) => v.role.includes("Kassierer") || v.role.includes("Schriftführer"));
const beisitzer = VORSTAND.filter((v) => v.role.includes("Beisitzer"));

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

      <Section id="vorstand" tone="paper-2">
        <Eyebrow className="mb-4">Vorstand</Eyebrow>
        <Heading level={2} className="max-w-[24ch]">
          Der Vorstand
        </Heading>
        <p className="prose-body mt-3 max-w-[52ch] text-[15px]">
          Der Vorstand des Gewerbevereins Treffpunkt Offenbach e. V.
        </p>

        {/* Vorsitzende: two, first and largest. */}
        <ul className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {vorsitzende.map((v) => (
            <li key={v.name} className="border-t pt-5" style={{ borderColor: "var(--c-line)" }}>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">{v.role}</p>
              <p className="mt-1 font-display text-[24px] font-semibold tracking-[-0.01em]">{v.name}</p>
            </li>
          ))}
        </ul>

        {/* Kassierer und Schriftführer. */}
        <ul className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {kasseSchrift.map((v) => (
            <li key={v.name} className="border-t pt-4" style={{ borderColor: "var(--c-line)" }}>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">{v.role}</p>
              <p className="mt-1 font-display text-[17px] font-semibold">{v.name}</p>
            </li>
          ))}
        </ul>

        {/* Beisitzer: quieter grid. */}
        <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          {beisitzer.map((v) => (
            <li key={v.name} className="border-t pt-3" style={{ borderColor: "var(--c-line)" }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{v.role}</p>
              <p className="mt-1 font-display text-[14px] font-semibold">{v.name}</p>
            </li>
          ))}
        </ul>

        <p className="prose-body mt-10 max-w-[60ch] text-[13px] text-muted">
          Namen und Funktionen — der Vorstand eines eingetragenen Vereins ist öffentlich, private Kontaktdaten sind
          es nicht. Persönliche Telefonnummern oder E-Mail-Adressen finden Sie hier bewusst nicht; die vollständigen
          Vorstandsangaben stehen zusätzlich im{" "}
          <Link href="/impressum" className="link-underline">
            Impressum
          </Link>
          .
        </p>
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
