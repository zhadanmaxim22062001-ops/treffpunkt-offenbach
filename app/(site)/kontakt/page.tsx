import type { Metadata } from "next";
import { Eyebrow, Heading, Lead, Section } from "@/components/ui";
import { StaticMap } from "@/components/StaticMap";
import { MailtoContactForm } from "@/components/MailtoContactForm";
import { VEREIN } from "@/data/verein";
import vereinMap from "@/data/verein-map.json";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "So erreichen Sie den Gewerbeverein Treffpunkt Offenbach e. V.",
};

export default function Page() {
  return (
    <Section>
      <Eyebrow className="mb-4">Kontakt</Eyebrow>
      <Heading level={1} className="max-w-[20ch]">
        Schreiben oder rufen Sie uns an.
      </Heading>
      <Lead className="mt-6 max-w-[60ch]">
        Ohne Cookies, ohne Drittanbieter — das Formular öffnet nur Ihr eigenes E-Mail-Programm.
      </Lead>

      <div className="mt-12 grid gap-12 md:grid-cols-[1fr_1fr]">
        <div>
          <p className="eyebrow mb-3">Nachricht schreiben</p>
          <MailtoContactForm toEmail={VEREIN.email} />

          <p className="eyebrow mb-3 mt-12">Direkt erreichbar</p>
          <address className="not-italic text-[16px] leading-relaxed text-ink-2">
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

        <div>
          <StaticMap slug="verein" meta={vereinMap} label={`${VEREIN.name}, ${VEREIN.street}, ${VEREIN.zip} ${VEREIN.city}`} />
        </div>
      </div>
    </Section>
  );
}
