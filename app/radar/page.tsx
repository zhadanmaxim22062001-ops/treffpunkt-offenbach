import { Eyebrow, Heading, Lead, Section } from "@/components/ui";

export const metadata = { title: "OF-Radar" };

export default function Page() {
  return (
    <Section>
      <Eyebrow className="mb-4">OF-Radar</Eyebrow>
      <Heading level={1} className="max-w-[20ch]">
        Der OF-Radar startet in Kürze.
      </Heading>
      <Lead className="mt-6 max-w-[60ch]">
        Meldungen aus Offenbach, gefiltert auf das, was Betriebe betrifft — sechs Rubriken, Filter nach Branche
        und Straße, Fristen mit Countdown. Nichts wird automatisch veröffentlicht: jede Meldung geht erst durch
        die Freigabe des Vorstands.
      </Lead>
      <p className="prose-body mt-8 max-w-[60ch] text-[15px] text-muted">
        Diese Seite zeigt noch keine Meldungen — die redaktionelle Freigabe ist noch nicht angebunden. Sobald sie
        es ist, erscheinen hier ausschließlich geprüfte, mit Quelle und Datum versehene Meldungen.
      </p>
    </Section>
  );
}
