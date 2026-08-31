import { Button, Card, Chip, Eyebrow, Heading, Lead, Rule, Section } from "@/components/ui";
import { LogoLockup, LogoMark } from "@/components/Logo";

export const metadata = { title: "Styleguide" };

const COLORS = [
  ["Ink", "#101A1D", "Текст, знак, тёмные секции"],
  ["Signalrot", "#E23D1F", "F в знаке, CTA, срочность"],
  ["Main-Grün", "#1F6F6B", "Теги рубрик, статус «всё ок»"],
  ["Kalkweiß", "#E9ECEA", "Основной фон"],
  ["Beton", "#C6CFCB", "Линейки и рамки"],
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
        <div className="flex flex-wrap items-end gap-12">
          <figure className="m-0"><LogoMark size={120} /><figcaption className="eyebrow mt-3">Mark 120</figcaption></figure>
          <figure className="m-0"><LogoMark size={64} /><figcaption className="eyebrow mt-3">Mark 64</figcaption></figure>
          <figure className="m-0"><LogoMark size={40} /><figcaption className="eyebrow mt-3">Compact 40</figcaption></figure>
          <figure className="m-0"><LogoMark size={24} /><figcaption className="eyebrow mt-3">Compact 24</figcaption></figure>
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
          <Chip tone="river">frequenz</Chip>
          <Chip tone="neutral">recht</Chip>
        </div>
        <Rule className="my-10" />
        <div className="grid gap-5 md:grid-cols-3">
          <Card><h3 className="font-display text-[17px] font-semibold">Card</h3>
            <p className="mt-2 text-[15px] text-ink-2">Волосяная рамка вместо тени, скругления нет.</p></Card>
          <Card accent><h3 className="font-display text-[17px] font-semibold">Card, accent</h3>
            <p className="mt-2 text-[15px] text-ink-2">Акцентная рамка — только для одного элемента на экране.</p></Card>
          <Card><p className="tnum font-mono text-[15px]">28.–31.05.2026 · 1 180 px · 66ch</p>
            <p className="mt-2 text-[14px] text-muted">tabular-nums во всех числах.</p></Card>
        </div>
      </Section>
    </>
  );
}
