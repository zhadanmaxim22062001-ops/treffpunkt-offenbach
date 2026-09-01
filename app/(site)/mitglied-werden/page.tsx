import type { Metadata } from "next";
import { Card, Eyebrow, Heading, Lead, Section } from "@/components/ui";
import { VEREIN } from "@/data/verein";

export const metadata: Metadata = {
  title: "Mitglied werden",
  description: "Vorteile der Mitgliedschaft im Gewerbeverein Treffpunkt Offenbach und wie Sie beitreten.",
};

const VORTEILE = [
  {
    title: "Sichtbarkeit in der Innenstadt",
    body: "Ihr Betrieb steht im Mitgliederverzeichnis der Seite — mit Adresse, Öffnungszeiten und Link zu Ihrer eigenen Website.",
  },
  {
    title: "Mitreden bei den Formaten",
    body: "Offenbacher Woche, Lichterfest, verkaufsoffene Sonntage: Mitglieder gestalten mit, statt nur zuzuschauen.",
  },
  {
    title: "OF-Radar zuerst",
    body: "Meldungen, die Ihr Geschäft betreffen — Sondernutzung, Baustellen, Fristen — bevor sie zum Problem werden.",
  },
];

export default function Page() {
  return (
    <>
      <Section>
        <Eyebrow className="mb-4">Mitglied werden</Eyebrow>
        <Heading level={1} className="max-w-[22ch]">
          So werden Sie Mitglied.
        </Heading>
        <Lead className="mt-6 max-w-[60ch]">
          Die Vorteile, eine offene Beitragstabelle und der direkte Weg zum Beitritt — eine Nachricht genügt.
        </Lead>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {VORTEILE.map((v) => (
            <Card key={v.title} className="h-full">
              <h2 className="font-display text-[17px] font-semibold">{v.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{v.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="paper-2">
        <Eyebrow className="mb-4">Beitrag</Eyebrow>
        <Heading className="max-w-[24ch]">Was die Mitgliedschaft kostet.</Heading>
        <div className="mt-8 max-w-[60ch] overflow-x-auto border" style={{ borderColor: "var(--c-line)" }}>
          <table className="w-full border-collapse text-[15px]">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: "var(--c-line)" }}>
                <th className="p-4 font-display font-semibold">Beitrag</th>
                <th className="p-4 font-display font-semibold">Höhe</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 text-ink-2">Jahresbeitrag</td>
                <td className="p-4 font-mono text-[13px] text-muted">TODO-COPY: beim Vorstand erfragen</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="prose-body mt-4 text-[14px] text-muted">
          Die genaue Staffelung ist noch offen und wird hier ergänzt, sobald der Vorstand sie mitgeteilt hat.
        </p>
      </Section>

      <Section>
        <Eyebrow className="mb-4">Beitritt</Eyebrow>
        <Heading className="max-w-[24ch]">Schreiben Sie uns.</Heading>
        <p className="prose-body mt-4 max-w-[60ch] text-[15px]">
          Am schnellsten per E-Mail oder Telefon — wir schicken Ihnen die Beitrittsunterlagen zu.
        </p>
        <address className="prose-body mt-6 not-italic text-[15px] leading-relaxed">
          <a className="link-underline font-display font-semibold" href={`mailto:${VEREIN.email}`}>
            {VEREIN.email}
          </a>
          <br />
          <a className="link-underline" href={`tel:${VEREIN.phone.replace(/\s/g, "")}`}>
            {VEREIN.phone}
          </a>
        </address>
        <p className="mt-6 font-mono text-[12px] text-muted">
          TODO-COPY: Das bisherige PDF-Beitrittsformular soll hier zusätzlich als Download stehen — das Dokument
          liegt uns aktuell nicht vor. Sobald der Vorstand es bereitstellt, verlinken wir es an dieser Stelle.
        </p>
      </Section>
    </>
  );
}
