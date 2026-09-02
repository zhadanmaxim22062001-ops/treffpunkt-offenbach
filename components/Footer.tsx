import Link from "next/link";
import { LogoMark } from "./Logo";
import { VEREIN } from "@/data/verein";

export function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: "var(--c-line)", backgroundColor: "var(--c-paper-2)" }}>
      <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-6 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <LogoMark size={72} />
          <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-ink-2">
            {VEREIN.name}. Wir beleben die Innenstadt, vernetzen Betriebe und vertreten ihre Interessen
            gegenüber der Stadt.
          </p>
        </div>

        <div>
          <p className="eyebrow mb-3">Kontakt</p>
          <address className="not-italic text-[15px] leading-relaxed text-ink-2">
            {VEREIN.street}
            <br />
            {VEREIN.addressNote}
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
          <p className="eyebrow mb-3">Seiten</p>
          <ul className="flex flex-col gap-2 text-[15px] text-ink-2">
            {[
              { href: "/verein", label: "Der Verein" },
              { href: "/verein#vorstand", label: "Vorstand" },
              { href: "/mitglieder", label: "Mitgliederverzeichnis" },
              { href: "/veranstaltungen", label: "Veranstaltungen" },
              { href: "/radar", label: "OF-Radar" },
              { href: "/mitglied-werden", label: "Mitglied werden" },
              { href: "/impressum", label: "Impressum" },
              { href: "/datenschutz", label: "Datenschutz" },
            ].map((l) => (
              <li key={l.href}>
                <Link className="link-underline" href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t" style={{ borderColor: "var(--c-line)" }}>
        <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-3 px-6 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            © {new Date().getFullYear()} {VEREIN.shortName}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Diese Seite setzt keine Cookies
          </p>
        </div>
      </div>
    </footer>
  );
}
