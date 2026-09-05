import { Eyebrow, Heading, Section } from "@/components/ui";
import { VEREIN, VORSTAND } from "@/data/verein";
import { HERO_PHOTO_CREDIT, isMediaCreditComplete } from "@/data/media";
import { getHeroImagePath } from "@/lib/hero-image";

export const metadata = { title: "Impressum" };

export default function Page() {
  const heroCredited = isMediaCreditComplete(HERO_PHOTO_CREDIT) && getHeroImagePath() !== null;

  return (
    <Section>
      <Eyebrow className="mb-4">Angaben gemäß § 5 DDG</Eyebrow>
      <Heading>Impressum</Heading>
      <div className="prose-body mt-8 flex flex-col gap-6 text-[16px]">
        <p><strong className="font-display">{VEREIN.name}</strong><br />
          {VEREIN.street}, {VEREIN.addressNote}<br />{VEREIN.zip} {VEREIN.city}</p>
        <p>Telefon: {VEREIN.phone}<br />E-Mail: {VEREIN.email}</p>
        <p>Inhaltlich verantwortlich: {VEREIN.responsible}</p>
        <p><strong className="font-display">Vorstand</strong><br />
          {VORSTAND.join(" · ")}</p>
        {/* TODO-COPY: Registergericht und Vereinsregisternummer ergänzen, sobald
            der Vorstand sie mitteilt — siehe VEREIN.registerNumber in data/verein.ts.
            OPEN QUESTION FOR THE BOARD (flagged, not guessed): § 5 DDG wants the
            Impressum to name who is authorised to represent the association
            (Vertretungsberechtigte, usually the Vorsitzende(n)). We have seven
            board names with no office assignments, so this Impressum can't say
            who that is — ask the board which of the seven (if any) hold that
            role, or confirm it's still Vorstand-as-a-whole. See README's "From
            the board, still needed" list. */}

        <div>
          <strong className="font-display">Bildnachweise</strong>
          <ul className="mt-2 flex flex-col gap-2 text-[15px]">
            {heroCredited && (
              <li>
                {HERO_PHOTO_CREDIT.description}: {HERO_PHOTO_CREDIT.author},{" "}
                <a
                  className="link-underline"
                  href={HERO_PHOTO_CREDIT.licenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {HERO_PHOTO_CREDIT.licenceName}
                </a>
                , via{" "}
                <a
                  className="link-underline"
                  href={HERO_PHOTO_CREDIT.filePageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Wikimedia Commons
                </a>
                . Bearbeitung: {HERO_PHOTO_CREDIT.modifications}.
              </li>
            )}
            <li>
              Kartenausschnitt (Kontakt): Kartendaten ©{" "}
              <a
                className="link-underline"
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
              >
                OpenStreetMap-Mitwirkende
              </a>
              .
            </li>
          </ul>
        </div>
      </div>
    </Section>
  );
}
