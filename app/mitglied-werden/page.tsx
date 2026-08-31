import type { Metadata } from "next";
import { Card, Eyebrow, Heading, Lead, Rule, Section } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { VEREIN } from "@/data/verein";

export const metadata: Metadata = {
  title: "Mitglied werden",
  description: "Vorteile der Mitgliedschaft im Gewerbeverein Treffpunkt Offenbach und das Antragsformular.",
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
          Beitreten dauert fünf Minuten, nicht einen PDF-Download.
        </Heading>
        <Lead className="mt-6 max-w-[60ch]">
          Vorteile, eine offene Beitragstabelle und ein Formular direkt auf dieser Seite.
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
        <Eyebrow className="mb-4">Antrag</Eyebrow>
        <Heading className="max-w-[24ch]">Formular</Heading>
        <p className="prose-body mt-4 max-w-[60ch] text-[15px] text-muted">
          TODO-COPY: Wer den Beitritt lieber schriftlich beantragt, soll hier auch das bisherige PDF-Formular
          herunterladen können — das Dokument liegt uns aktuell nicht vor. Sobald es vorhanden ist, verlinken wir
          es an dieser Stelle als Alternative zum Formular unten.
        </p>
        <Rule className="my-10" />
        <div className="max-w-[52ch]">
          <ContactForm
            endpoint="/api/mitglied-werden"
            extraFields={["betrieb", "branche", "adresse", "telefon"]}
            submitLabel="Antrag senden"
            consentText={
              <>
                Ich bin damit einverstanden, dass der {VEREIN.name} die oben angegebenen Daten (Name, Betrieb,
                Branche, Adresse, E-Mail-Adresse, ggf. Telefon, Nachricht) zur Bearbeitung dieser Mitgliedsanfrage
                verarbeitet. Der Versand erfolgt über den E-Mail-Dienstleister Resend als Auftragsverarbeiter. Die
                Daten werden{" "}
                <span className="font-mono text-[12px] text-muted">
                  [TODO-COPY: Aufbewahrungsdauer beim Vorstand erfragen]
                </span>{" "}
                gespeichert und nicht an Dritte weitergegeben. Sie können diese Einwilligung jederzeit per E-Mail an{" "}
                {VEREIN.email} widerrufen. Näheres in der{" "}
                <a href="/datenschutz" className="link-underline">
                  Datenschutzerklärung
                </a>
                .
              </>
            }
          />
        </div>
      </Section>
    </>
  );
}
