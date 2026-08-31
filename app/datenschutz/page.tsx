import { Eyebrow, Heading, Section } from "@/components/ui";
import { VEREIN } from "@/data/verein";
export const metadata = { title: "Datenschutz" };
export default function Page() {
  return (
    <Section>
      <Eyebrow className="mb-4">Datenschutzerklärung</Eyebrow>
      <Heading>Datenschutz</Heading>
      <div className="prose-body mt-8 flex flex-col gap-5 text-[16px]">
        <p>Diese Website setzt keine Cookies und bindet keine Dienste Dritter ein. Schriften werden vom
          eigenen Server ausgeliefert, es besteht keine Verbindung zu Google Fonts.</p>
        <p>Beim Aufruf der Seite verarbeitet unser Hoster technisch notwendige Zugriffsdaten. Eine
          Zusammenführung mit anderen Daten findet nicht statt.</p>
        <p>Verantwortlich: {VEREIN.name}, {VEREIN.street}, {VEREIN.zip} {VEREIN.city}, {VEREIN.email}.</p>
        <p className="font-mono text-[12px] text-muted">
          TODO: vollständige Fassung juristisch prüfen lassen, bevor die Seite live geht.
        </p>
      </div>
    </Section>
  );
}
