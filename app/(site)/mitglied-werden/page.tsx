import type { Metadata } from "next";
import { Card, Eyebrow, Heading, Lead, Section } from "@/components/ui";
import { VEREIN } from "@/data/verein";

export const metadata: Metadata = {
  title: "Mitglied werden",
  description: "Vorteile der Mitgliedschaft im Gewerbeverein Treffpunkt Offenbach und wie Sie beitreten.",
};

// The association's own four benefits, taken from treffpunkt-of.de.
const VORTEILE = [
  {
    title: "Schnelle umfassende Informationen",
    body: "Was in der Innenstadt passiert und was es für Ihren Betrieb bedeutet, bevor es zum Problem wird — siehe auch den OF-Radar.",
  },
  {
    title: "Mitglieder-Netzwerk",
    body: "Über hundert Betriebe, die dieselben Straßen teilen. Nachbarn kennen heißt schneller einen Handwerker, einen Nachmieter oder eine Lösung finden.",
  },
  {
    title: "Kostenvorteile für Mitglieder bei Aktionen",
    body: "Bei gemeinsamen Aktionen und Formaten wie der Offenbacher Woche profitieren Mitglieder von besseren Konditionen.",
  },
];

// The most concrete, most persuasive benefit on the old site — never buried
// fourth in a list. Its own card, its own room.
const PROBLEMLOESUNGEN = {
  title: "Problemlösungen",
  body: "Konkrete Unterstützung bei Dingen, die ein einzelner Betrieb allein nur mühsam klärt — zum Beispiel bei der Beschaffung und Genehmigung von Werbeschildern.",
};

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

        <div className="mt-10 max-w-[60ch]">
          <p className="eyebrow mb-2">Der Verein über sich selbst</p>
          <blockquote
            className="border-l-2 pl-5 font-display text-[17px] italic leading-snug text-ink-2"
            style={{ borderColor: "var(--c-accent)" }}
          >
            „In Offenbach sind alle relevanten Kaufhäuser und Gastronomen Mitglieder des Treffpunkt Offenbach.“
          </blockquote>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {VORTEILE.map((v) => (
            <Card key={v.title} className="h-full">
              <h2 className="font-display text-[17px] font-semibold">{v.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{v.body}</p>
            </Card>
          ))}
        </div>

        <Card accent className="mt-5">
          <h2 className="font-display text-[19px] font-semibold">{PROBLEMLOESUNGEN.title}</h2>
          <p className="prose-body mt-3 max-w-[60ch] text-[15px]">{PROBLEMLOESUNGEN.body}</p>
        </Card>
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
