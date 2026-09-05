import Link from "next/link";
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

      <Section id="vorstand" tone="paper-2">
        <Eyebrow className="mb-4">Vorstand</Eyebrow>
        <Heading level={2} className="max-w-[24ch]">
          Der Vorstand
        </Heading>
        <p className="prose-body mt-3 max-w-[52ch] text-[15px]">
          Der Vorstand des Gewerbevereins Treffpunkt Offenbach e. V.
        </p>

        {/* Plain list, in the association's own order — seven rows, so a
            single column stays even; a two-column grid would leave one row
            stranded. Space, not rules, separates them. Names only: the
            board changed and no office assignments were given with the new
            roster, so there is no role line to show. */}
        <ul className="mt-10 flex flex-col gap-4 max-w-[28ch]">
          {VORSTAND.map((name) => (
            <li key={name}>
              <p className="font-display text-[19px] font-semibold">{name}</p>
            </li>
          ))}
        </ul>

        <p className="prose-body mt-10 max-w-[60ch] text-[13px] text-muted">
          Namen — der Vorstand eines eingetragenen Vereins ist öffentlich, private Kontaktdaten sind
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
          <a className="link-underline" href={`tel:${VEREIN.phoneE164}`}>
            {VEREIN.phone}
          </a>
          <br />
          <a className="link-underline" href={`mailto:${VEREIN.email}`}>
            {VEREIN.email}
          </a>
        </address>
        <p className="mt-8 font-mono text-[12px] text-muted">
          Satzung und eine ausführlichere Vereinsgeschichte folgen an dieser Stelle.
        </p>
      </Section>
    </>
  );
}
