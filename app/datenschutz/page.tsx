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

        <p>
          <strong className="font-display">Hosting</strong><br />
          Diese Website wird bei Vercel Inc. gehostet, einem Unternehmen mit Sitz in den USA. Vercel verarbeitet
          dabei als Auftragsverarbeiter die technisch notwendigen Zugriffsdaten, die beim Aufruf der Seite anfallen.
          Eine Zusammenführung mit anderen Daten findet nicht statt.{" "}
          <span className="font-mono text-[12px] text-muted">
            [TODO-COPY: Abschluss eines Auftragsverarbeitungsvertrags (AVV) mit Vercel bestätigen und hier
            referenzieren.]
          </span>
        </p>

        <p>
          <strong className="font-display">Kontakt- und Mitgliedsformular</strong><br />
          Daten, die Sie über das Kontakt- oder Mitgliedsformular an uns senden, verarbeiten wir ausschließlich
          zur Bearbeitung Ihrer Anfrage. Für den Versand nutzen wir den E-Mail-Dienstleister Resend (Resend, Inc.),
          ebenfalls ein Unternehmen mit Sitz in den USA, als Auftragsverarbeiter; die Inhalte werden zu diesem
          Zweck über dessen Server geleitet. Eine Weitergabe an andere Dritte findet nicht statt. Näheres zur
          Speicherdauer finden Sie im Einwilligungstext direkt am jeweiligen Formular.{" "}
          <span className="font-mono text-[12px] text-muted">
            [TODO-COPY: Abschluss eines Auftragsverarbeitungsvertrags (AVV) mit Resend bestätigen und hier
            referenzieren.]
          </span>
        </p>

        <p>
          <strong className="font-display">OF-Radar Wochendigest</strong><br />
          Für den wöchentlichen E-Mail-Digest des OF-Radar speichern wir Ihre E-Mail-Adresse erst nach
          Double-Opt-in: Nach der Anmeldung erhalten Sie eine Bestätigungs-E-Mail, gespeichert wird nur, wer den
          darin enthaltenen Link tatsächlich anklickt — dieser Zeitpunkt wird als Einwilligungsdatum vermerkt. Jede
          Digest-E-Mail enthält einen Abmeldelink, der ohne Login funktioniert; ein Klick darauf löscht Ihre
          E-Mail-Adresse und das Einwilligungsdatum unwiderruflich aus unserer Datenbank — es gibt keinen
          gesonderten "abgemeldet"-Zustand, in dem die Adresse weiter vorgehalten würde. Auch der Versand dieser
          Digest-Mails läuft über Resend, siehe oben.
        </p>

        <p>
          <strong className="font-display">Datenbank</strong><br />
          Für das OF-Radar setzen wir eine Postgres-Datenbank bei Neon (Neon, Inc.) ein, betrieben in der
          EU-Region Frankfurt — die Daten selbst verlassen die EU damit nicht. Neon, Inc. als Unternehmen hat
          seinen Sitz in den USA.{" "}
          <span className="font-mono text-[12px] text-muted">
            [TODO-COPY: Abschluss eines Auftragsverarbeitungsvertrags (AVV) mit Neon bestätigen und hier
            referenzieren.]
          </span>
        </p>

        <p>
          <strong className="font-display">Datenübermittlung in Drittländer</strong><br />
          Vercel, Resend und Neon haben als Unternehmen ihren Sitz in den USA, auch wenn — wie bei Neon — die
          Daten selbst in der EU gespeichert werden. Ob und in welchem Umfang dadurch eine Übermittlung in ein
          Drittland im Sinne von Art. 44 ff. DSGVO vorliegt und welche Rechtsgrundlage jeweils greift, ist offen.{" "}
          <span className="font-mono text-[12px] text-muted">
            [TODO-COPY: Rechtsgrundlage je Anbieter bestätigen und konkret benennen — z. B. Zertifizierung nach dem
            EU-US Data Privacy Framework oder Standardvertragsklauseln (SCC) — bevor die Seite live geht.]
          </span>
        </p>

        <p>
          <strong className="font-display">Speicherdauer</strong><br />
          <span className="font-mono text-[12px] text-muted">
            [TODO-COPY: Aufbewahrungsfristen für Formulardaten und Zugriffsprotokolle mit dem Vorstand festlegen.
            Für den Wochendigest gilt: gespeichert wird, bis Sie sich abmelden — siehe oben.]
          </span>
        </p>

        <p>Verantwortlich: {VEREIN.name}, {VEREIN.street}, {VEREIN.zip} {VEREIN.city}, {VEREIN.email}.</p>
        <p className="font-mono text-[12px] text-muted">
          TODO: vollständige Fassung juristisch prüfen lassen, bevor die Seite live geht.
        </p>
      </div>
    </Section>
  );
}
