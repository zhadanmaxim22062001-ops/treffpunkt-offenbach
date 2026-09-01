import type { Metadata } from "next";
import { Eyebrow, Heading, Lead, Section } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { StaticMap } from "@/components/StaticMap";
import { VEREIN } from "@/data/verein";
import vereinMap from "@/data/verein-map.json";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Schreiben Sie dem Gewerbeverein Treffpunkt Offenbach e. V. — Formular ohne Cookies und ohne Drittanbieter.",
};

export default function Page() {
  return (
    <Section>
      <Eyebrow className="mb-4">Kontakt</Eyebrow>
      <Heading level={1} className="max-w-[20ch]">
        Schreiben Sie uns.
      </Heading>
      <Lead className="mt-6 max-w-[60ch]">
        Formular ohne Drittanbieter, ohne Captcha-Dienst und ohne Cookies.
      </Lead>

      <div className="mt-12 grid gap-12 md:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-10">
          <div className="max-w-[52ch]">
            <ContactForm
              endpoint="/api/kontakt"
              submitLabel="Nachricht senden"
              consentText={
                <>
                  Ich bin damit einverstanden, dass der {VEREIN.name} die oben angegebenen Daten (Name,
                  E-Mail-Adresse, Nachricht) zur Bearbeitung dieser Anfrage verarbeitet. Der Versand erfolgt über den
                  E-Mail-Dienstleister Resend als Auftragsverarbeiter. Die Daten werden{" "}
                  <span className="font-mono text-[12px] text-muted">
                    [TODO-COPY: Aufbewahrungsdauer beim Vorstand erfragen]
                  </span>{" "}
                  gespeichert und nicht an Dritte weitergegeben. Sie können diese Einwilligung jederzeit per E-Mail
                  an {VEREIN.email} widerrufen. Näheres in der{" "}
                  <a href="/datenschutz" className="link-underline">
                    Datenschutzerklärung
                  </a>
                  .
                </>
              }
            />
          </div>

          <div>
            <p className="eyebrow mb-3">Direkt erreichbar</p>
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
          </div>
        </div>

        <div>
          <StaticMap slug="verein" meta={vereinMap} label={`${VEREIN.name}, ${VEREIN.street}, ${VEREIN.zip} ${VEREIN.city}`} />
        </div>
      </div>
    </Section>
  );
}
