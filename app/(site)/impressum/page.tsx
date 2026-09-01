import { Eyebrow, Heading, Section } from "@/components/ui";
import { VEREIN, VORSTAND } from "@/data/verein";
export const metadata = { title: "Impressum" };
export default function Page() {
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
          {VORSTAND.map((v) => `${v.name} (${v.role})`).join(" · ")}</p>
        <p className="font-mono text-[12px] text-muted">
          TODO: Registergericht und Vereinsregisternummer ergänzen — beim Vorstand anfragen.
        </p>
      </div>
    </Section>
  );
}
