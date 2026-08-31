import { notFound } from "next/navigation";
import { Eyebrow, Heading, Section } from "@/components/ui";
import { EVENTS } from "@/data/content";

export function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = EVENTS.find((e) => e.slug === slug);
  if (!event) notFound();
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Event", name: event.title,
    startDate: event.isoStart,
    location: { "@type": "Place", name: event.place, address: "Offenbach am Main" },
  };
  return (
    <Section>
      <Eyebrow className="mb-4">{event.when} · {event.place}</Eyebrow>
      <Heading>{event.title}</Heading>
      <p className="prose-body mt-6">{event.summary}</p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Section>
  );
}
