import { Button, Card, Chip, Eyebrow, Heading, Lead, Rule, Section } from "@/components/ui";
import { LogoLockup, LogoMark } from "@/components/Logo";

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
        <Eyebrow className="mb-6">Marke</Eyebrow>
        <p className="prose-body mb-8 max-w-[60ch] text-[14px] text-muted">
          Drei Zeichnungen, nicht eine skalierte: <strong>Primär</strong> ab 64px (offener Ring, Stärke 13),{" "}
          <strong>Header</strong> von 28–63px, für den Bereich, in dem der offene Ring sonst optisch zulaufen würde
          (gleicher Ring, aber Stärke 16, breitere Lücke, kürzerer Arm — Wiedererkennung schlägt hier die optische
          Regel), <strong>Kompakt</strong> unter 28px (geschlossener Ring, Stärke 19).
        </p>
        <div className="flex flex-wrap items-end gap-12">
          <figure className="m-0"><LogoMark size={120} /><figcaption className="eyebrow mt-3">Primär · ab 64px</figcaption></figure>
          <figure className="m-0"><LogoMark size={64} /><figcaption className="eyebrow mt-3">Primär · 64px</figcaption></figure>
          <figure className="m-0"><LogoMark size={48} /><figcaption className="eyebrow mt-3">Header · 28–63px</figcaption></figure>
          <figure className="m-0"><LogoMark size={40} /><figcaption className="eyebrow mt-3">Header · 40px (Navigation)</figcaption></figure>
          <figure className="m-0"><LogoMark size={24} /><figcaption className="eyebrow mt-3">Kompakt · unter 28px</figcaption></figure>
          <figure className="m-0"><LogoLockup markSize={56} /><figcaption className="eyebrow mt-3">Lockup</figcaption></figure>
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
          <Lead>Wir sind über hundert Betriebe, die dieselbe Straße teilen.</Lead>
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
