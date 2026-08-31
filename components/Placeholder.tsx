import { Eyebrow, Heading, Section } from "@/components/ui";

/** Stub for pages that get built in later steps. */
export function Placeholder({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <Section>
      <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
      <Heading className="max-w-[18ch]">{title}</Heading>
      <p className="prose-body mt-6">{body}</p>
      <p className="mt-8 inline-block px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em]"
         style={{ background: "var(--c-accent-soft)", color: "var(--c-accent)" }}>
        In Arbeit — nächster Bauabschnitt
      </p>
    </Section>
  );
}
