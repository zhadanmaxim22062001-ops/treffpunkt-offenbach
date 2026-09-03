import { Eyebrow, Heading, Section } from "@/components/ui";
import { VEREIN } from "@/data/verein";
export const metadata = { title: "Datenschutz" };
export default function Page() {
  return (
    <Section>
      <Eyebrow className="mb-4">Datenschutzerklärung</Eyebrow>
      <Heading>Datenschutz</Heading>
      <div className="prose-body mt-8 flex flex-col gap-5 text-[16px]">
        <p>Diese Website setzt keine Cookies und bindet keine Drittanbieter-Skripte ein. Schriften, Kartenausschnitte
          und alle sonstigen Inhalte werden vom eigenen Server ausgeliefert — es besteht keine Verbindung zu Google
          Fonts oder anderen Drittanbietern. Das Kontaktformular auf der{" "}
          <a href="/kontakt" className="link-underline">Kontaktseite</a> sendet keine Daten an uns oder Dritte über
          diese Website — es öffnet lediglich Ihr eigenes E-Mail-Programm mit einem vorausgefüllten Entwurf, den Sie
          selbst absenden. Es werden keine personenbezogenen Daten von Besuchern erhoben, außer den technisch
          notwendigen Zugriffsdaten, die beim Hosting anfallen (siehe unten).</p>

        <p>
          <strong className="font-display">Hosting</strong><br />
          Diese Website wird bei Vercel Inc. gehostet, einem Unternehmen mit Sitz in den USA. Vercel verarbeitet
          dabei als Auftragsverarbeiter die technisch notwendigen Zugriffsdaten, die beim Aufruf der Seite anfallen
          (z. B. IP-Adresse, Zeitpunkt des Zugriffs). Eine Zusammenführung mit anderen Daten findet nicht statt. Der
          Nachweis eines Auftragsverarbeitungsvertrags mit Vercel wird an dieser Stelle ergänzt, sobald er vorliegt.
        </p>

        <p>
          <strong className="font-display">Datenübermittlung in Drittländer</strong><br />
          Vercel hat als Unternehmen seinen Sitz in den USA, außerhalb der EU und des EWR. Ob und in welchem
          Umfang dadurch eine Übermittlung in ein Drittland im Sinne von Art. 44 ff. DSGVO vorliegt und welche
          Rechtsgrundlage greift (z. B. das EU-US Data Privacy Framework oder Standardvertragsklauseln), wird an
          dieser Stelle benannt, sobald sie feststeht.
        </p>

        <p>
          <strong className="font-display">Speicherdauer</strong><br />
          Die genaue Aufbewahrungsfrist für die bei Vercel anfallenden Zugriffsprotokolle liegt uns noch nicht vor
          und wird an dieser Stelle ergänzt, sobald sie feststeht.
        </p>

        <p>
          Kontaktieren möchten Sie uns lieber direkt? E-Mail und Telefonnummer finden Sie auf der{" "}
          <a href="/kontakt" className="link-underline">
            Kontaktseite
          </a>
          . Eine Nachricht auf diesem Weg verarbeiten wir ausschließlich zur Beantwortung Ihrer Anfrage; sie läuft
          über Ihr eigenes E-Mail-Programm und nicht über diese Website.
        </p>

        <p>Verantwortlich: {VEREIN.name}, {VEREIN.street}, {VEREIN.zip} {VEREIN.city}, {VEREIN.email}.</p>
        {/* TODO: have the complete text reviewed by a lawyer before relying on it as final. */}
      </div>
    </Section>
  );
}
