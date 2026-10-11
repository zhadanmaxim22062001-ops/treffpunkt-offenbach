import { Button, Card, Chip, Eyebrow, Heading, Lead, Rule, Section } from "@/components/ui";
import { HeroDot, Logo, logoMinHeight, logoWidth } from "@/components/Logo";

export const metadata = { title: "Styleguide", robots: { index: false, follow: false } };

const COLORS = [
  ["Ink", "#0B2138", "Text, dunkle Sektionen"],
  ["Blau", "#0F5FA8", "F im Zeichen, CTA, Links"],
  ["Blau, hell", "#E1EDF9", "Getönte Flächen — „Was das für Sie heißt“-Boxen"],
  ["Signal", "#A34515", "Nur Dringlichkeit und Fristen — sonst nichts"],
  ["Signal, hell", "#FAE7DC", "Getönte Fläche für Signal, gleiche Regel"],
  ["Kalkweiß", "#F5F9FC", "Grundfläche"],
  ["Beton", "#C9D8E5", "Linien und Rahmen"],
];

export default function Styleguide() {
  return (
    <>
      <Section>
        <Eyebrow className="mb-4">Interne Seite</Eyebrow>
        <Heading level={1}>Styleguide</Heading>
        <Lead className="mt-6">Alle Bausteine an einem Ort — zum Abgleich, bevor Seiten daraus gebaut werden.</Lead>
      </Section>

      <Section tone="paper-2">
        <Eyebrow className="mb-6">Logo</Eyebrow>
        <p className="prose-body mb-8 max-w-[60ch] text-[14px] text-muted">
          Das Logo ist das des Vereins und wird nicht verändert: keine andere Schrift, keine andere Laufweite, kein
          anderer Punkt, keine Farbe, kein Filter, und der Schatten bleibt. Aus den Originalkonturen vektorisiert, alle
          Dateien liegen unter <code className="font-mono text-[12px]">/brand</code>. Hell- und Dunkelvariante
          unterscheiden sich <strong>nur</strong> in der Textfarbe (#3B3B3B → #F2F6F9); beide sind immer im DOM, CSS
          zeigt eine — kein Skript, kein Filter.
        </p>
        <div className="flex flex-wrap items-end gap-12">
          <figure className="m-0">
            <Logo variant="full" height={logoMinHeight("full")} />
            <figcaption className="eyebrow mt-3">Voll · mindestens {logoWidth("full", logoMinHeight("full"))} px breit</figcaption>
          </figure>
          <figure className="m-0">
            <Logo variant="compact" height={logoMinHeight("compact")} />
            <figcaption className="eyebrow mt-3">Kompakt · mindestens {logoWidth("compact", logoMinHeight("compact"))} px breit</figcaption>
          </figure>
          <figure className="m-0">
            <HeroDot shadow style={{ width: 120, height: 120 }} />
            <figcaption className="eyebrow mt-3">Punkt mit Schatten · nur helle Seite</figcaption>
          </figure>
        </div>

        <h3 className="mt-14 font-display text-[17px] font-semibold">Schutzraum und Mindestgröße</h3>
        <ul className="prose-body mt-3 max-w-[60ch] list-disc pl-5 text-[14px]">
          <li>
            Schutzraum auf allen vier Seiten: der Durchmesser des Kernpunkts — das sind 220 von 1051 Einheiten, also{" "}
            <span className="tnum">20,9</span> % der Logobreite (bei <span className="tnum">172</span> px Breite
            etwa <span className="tnum">36</span> px).
          </li>
          <li>
            Mindestbreite: <span className="tnum">170</span> px gilt nur für den dreizeiligen Block (Footer, Open
            Graph, Druck, E-Mail); die kompakte Zeile darf bis <span className="tnum">120</span> px herunter. Darunter
            wird die dritte Zeile unleserlich.
          </li>
          <li>
            Im Kopfbereich steht nie der dreizeilige Block: sein Punkt ist etwa viermal so hoch wie die Versalhöhe von
            TREFFPUNKT, bei Kopfzeilenhöhe wäre die dritte Zeile Matsch. Dort steht die kompakte Zeile,{" "}
            <span className="tnum">60</span> px hoch (<span className="tnum">161</span> px breit), unter 640 px{" "}
            <span className="tnum">48</span> px (<span className="tnum">129</span> px). Der Footer zeigt den vollen Block
            mit <span className="tnum">110</span> px Höhe (<span className="tnum">263</span> px breit).{" "}
            <code className="font-mono text-[12px]">logoMinHeight()</code> in components/Logo.tsx warnt in der
            Entwicklung, wenn jemand unter die Mindestbreite geht.
          </li>
        </ul>
        <div className="mt-8 flex flex-wrap items-start gap-12">
          <figure className="m-0">
            <div
              className="inline-block border border-dashed"
              style={{ borderColor: "var(--c-muted)", padding: `${(logoWidth("full", logoMinHeight("full")) * 220) / 1051}px` }}
            >
              <Logo variant="full" height={logoMinHeight("full")} />
            </div>
            <figcaption className="eyebrow mt-3">Schutzraum (gestrichelt) = Kernpunkt-Durchmesser</figcaption>
          </figure>
        </div>

        <h3 className="mt-14 font-display text-[17px] font-semibold">Die zwei Blautöne des Logos</h3>
        <p className="prose-body mt-3 max-w-[60ch] text-[14px] text-muted">
          Eigene Tokens, nur für das Logo: <code className="font-mono text-[12px]">--c-brand-dot</code> (#5898C4) und{" "}
          <code className="font-mono text-[12px]">--c-brand-halo</code> (#C0E0EB). Der Kernpunkt hat auf Weiß nur{" "}
          <span className="tnum">3,2</span>:1 — als Fläche in Ordnung, für Text, Links, Buttons, Chips und Fokusringe
          nicht. Die Oberfläche bleibt bei <code className="font-mono text-[12px]">--c-accent</code>.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {[
            ["Kernpunkt", "--c-brand-dot", "#5898C4"],
            ["Lichthof", "--c-brand-halo", "#C0E0EB"],
          ].map(([name, token, hex]) => (
            <div key={token} className="w-[170px] border" style={{ borderColor: "var(--c-line)" }}>
              <div style={{ background: `var(${token})`, height: 56 }} />
              <div className="p-3">
                <p className="font-display text-[13px] font-semibold">{name}</p>
                <p className="font-mono text-[11px] text-muted">{token}</p>
                <p className="font-mono text-[11px] text-muted">{hex}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow className="mb-6">Farbe</Eyebrow>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {COLORS.map(([name, hex, use]) => (
            <div key={hex} className="border" style={{ borderColor: "var(--c-line)" }}>
              <div style={{ background: hex, height: 78 }} />
              <div className="p-3">
                <p className="font-display text-[13px] font-semibold">{name}</p>
                <p className="font-mono text-[11px] text-muted">{hex}</p>
                <p className="mt-1 font-display text-[12px] leading-snug text-muted">{use}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="paper-2">
        <Eyebrow className="mb-6">Typografie</Eyebrow>
        <div className="flex flex-col gap-6">
          <Heading level={1}>Innenstadt beleben.</Heading>
          <Heading level={2}>Nachbarn kennen.</Heading>
          <Heading level={3}>Fristen nicht verpassen.</Heading>
          <Lead>Wir sind Betriebe, die dieselbe Straße teilen.</Lead>
          <p className="prose-body">Fließtext in Newsreader 400. Antiqua im Text ist bei Vereinsseiten selten
            und unterscheidet die Seite genau deshalb sofort. Zeilenlänge bleibt bei 66 Zeichen.</p>
          <p className="eyebrow">Eyebrow · IBM Plex Mono · 0.14em</p>
        </div>
      </Section>

      <Section>
        <Eyebrow className="mb-6">Komponenten</Eyebrow>
        <div className="flex flex-wrap items-center gap-3">
          <Button href="#">Solid</Button>
          <Button href="#" variant="outline">Outline</Button>
          <Button href="#" variant="ghost">Ghost</Button>
          <Chip>rathaus</Chip>
          <Chip tone="neutral">recht</Chip>
          <Chip tone="signal">noch 3 Tage</Chip>
        </div>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
          Hover: Outline-Button zieht eine Linie unter dem Text, Card hebt sich 1px an und färbt den Rand Akzent.
        </p>
        <Rule className="my-10" />
        <div className="grid gap-5 md:grid-cols-3">
          <Card><h3 className="font-display text-[17px] font-semibold">Card</h3>
            <p className="mt-2 text-[15px] text-ink-2">Haarlinie statt Schatten, keine Rundung.</p></Card>
          <Card accent><h3 className="font-display text-[17px] font-semibold">Card, accent</h3>
            <p className="mt-2 text-[15px] text-ink-2">Akzentrahmen — nur für ein Element pro Bildschirm.</p></Card>
          <Card><p className="tnum font-mono text-[15px]">28.–31.05.2026 · 1 180 px · 66ch</p>
            <p className="mt-2 text-[14px] text-muted">tabular-nums bei jeder Zahl.</p></Card>
        </div>
      </Section>
    </>
  );
}
