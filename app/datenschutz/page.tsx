import { Eyebrow, Heading, Section } from "@/components/ui";
import { VEREIN } from "@/data/verein";
export const metadata = { title: "Datenschutz" };
export default function Page() {
  return (
    <Section>
      <Eyebrow className="mb-4">Datenschutzerklärung</Eyebrow>
      <Heading>Datenschutz</Heading>
      <div className="prose-body mt-8 flex flex-col gap-5 text-[16px]">
        <p>Diese Website setzt keine Cookies. Schriften, Kartenausschnitte und alle sonstigen Inhalte werden vom
          eigenen Server ausgeliefert — es besteht keine Verbindung zu Google Fonts oder anderen
          Drittanbieter-Einbindungen.</p>
        <p>Beim Aufruf der Seite verarbeitet unser Hoster technisch notwendige Zugriffsdaten. Eine
          Zusammenführung mit anderen Daten findet nicht statt.</p>
        <p>
          <strong className="font-display">Kontakt- und Mitgliedsformular</strong><br />
          Daten, die Sie über das Kontakt- oder Mitgliedsformular an uns senden, verarbeiten wir ausschließlich
          zur Bearbeitung Ihrer Anfrage. Für den Versand nutzen wir den E-Mail-Dienstleister Resend (Resend, Inc.)
          als Auftragsverarbeiter; die Inhalte werden zu diesem Zweck über dessen Server geleitet. Eine
          Weitergabe an andere Dritte findet nicht statt. Näheres zur Speicherdauer finden Sie im
          Einwilligungstext direkt am jeweiligen Formular.
        </p>
        <p>Verantwortlich: {VEREIN.name}, {VEREIN.street}, {VEREIN.zip} {VEREIN.city}, {VEREIN.email}.</p>
        <p className="font-mono text-[12px] text-muted">
          TODO: vollständige Fassung juristisch prüfen lassen, bevor die Seite live geht.
        </p>
      </div>
    </Section>
  );
}
