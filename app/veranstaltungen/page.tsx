import Link from "next/link";
import { Eyebrow, Heading, Section } from "@/components/ui";
import { EVENTS } from "@/data/content";
export const metadata = { title: "Veranstaltungen" };
export default function Page() {
  return (
    <Section>
      <Eyebrow className="mb-4">Veranstaltungen</Eyebrow>
      <Heading className="max-w-[20ch]">Was wir im Jahr in die Innenstadt bringen.</Heading>
      <ul className="mt-12 flex flex-col">
        {EVENTS.map((e) => (
          <li key={e.slug} className="border-t py-7" style={{ borderColor: "var(--c-line)" }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{e.when} · {e.place}</p>
            <h2 className="mt-2 font-display text-[22px] font-semibold tracking-[-0.02em]">
              <Link href={`/veranstaltungen/${e.slug}`} className="link-underline">{e.title}</Link>
            </h2>
            <p className="prose-body mt-2 text-[15px]">{e.summary}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
