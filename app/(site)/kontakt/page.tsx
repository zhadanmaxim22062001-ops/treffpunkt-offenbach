import type { Metadata } from "next";
import { Eyebrow, Heading, Lead, Section } from "@/components/ui";
import { StaticMap } from "@/components/StaticMap";
import { ContactForm } from "@/components/ContactForm";
import { VEREIN } from "@/data/verein";
import vereinMap from "@/data/verein-map.json";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "So erreichen Sie den Gewerbeverein Treffpunkt Offenbach e. V.",
};

type SearchParams = { gesendet?: string; fehler?: string };

/**
 * `gesendet`/`fehler` are how the no-JS fallback reports a result: a plain
 * browser POST to /api/kontakt (see that route) ends in a 303 redirect back
 * here with one of these flags, and this server component renders the
 * matching state — no client JS required to see whether the message went
 * through. A JS-enabled visitor never sees these; ContactForm intercepts
 * the submit and renders its own success/error state in place instead.
 */
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;

  return (
    <Section>
      <Eyebrow className="mb-4">Kontakt</Eyebrow>
      <Heading level={1} className="max-w-[20ch]">
        Schreiben oder rufen Sie uns an.
      </Heading>
      <Lead className="mt-6 max-w-[60ch]">
        Ihre Nachricht kommt direkt in unserem Postfach an — kein Cookie, kein Drittanbieter.
      </Lead>

      <div className="mt-12 grid gap-12 md:grid-cols-[1fr_1fr]">
        <div>
          <p className="eyebrow mb-3">Nachricht schreiben</p>
          {sp.gesendet === "1" ? (
            <div
              role="status"
              className="border p-6"
              style={{ borderColor: "var(--c-accent)", backgroundColor: "var(--c-accent-soft)" }}
            >
              <p className="font-display text-[16px] font-semibold" style={{ color: "var(--c-accent)" }}>
                Danke, Ihre Nachricht ist angekommen.
              </p>
              <p className="mt-2 text-[14px] text-ink-2">Wir melden uns so bald wie möglich bei Ihnen.</p>
            </div>
          ) : (
            <>
              {sp.fehler === "1" && (
                <div
                  role="alert"
                  className="mb-5 border p-4"
                  style={{ borderColor: "var(--c-signal)", backgroundColor: "var(--c-signal-soft)" }}
                >
                  <p className="font-mono text-[12px]" style={{ color: "var(--c-signal)" }}>
                    Die Nachricht konnte nicht gesendet werden. Bitte prüfen Sie Ihre Angaben und versuchen Sie es
                    erneut, oder schreiben Sie uns direkt.
                  </p>
                </div>
              )}
              <ContactForm
                endpoint="/api/kontakt"
                extraFields={["telefon", "unternehmen"]}
                submitLabel="Nachricht senden"
                consentText={
                  <>
                    Ich habe die{" "}
                    <a href="/datenschutz" className="link-underline">
                      Datenschutzerklärung
                    </a>{" "}
                    gelesen und bin damit einverstanden, dass meine Angaben zur Bearbeitung meiner Anfrage
                    gespeichert und verarbeitet werden.
                  </>
                }
                fallbackContact={
                  <>
                    oder schreiben Sie direkt an{" "}
                    <a className="link-underline" href={`mailto:${VEREIN.email}`}>
                      {VEREIN.email}
                    </a>
                  </>
                }
              />
            </>
          )}

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
            <a className="link-underline" href={`tel:${VEREIN.phoneE164}`}>
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
