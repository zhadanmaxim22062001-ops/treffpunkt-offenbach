import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Eyebrow, Heading, Section } from "@/components/ui";
import { VereinEventBody } from "@/components/VereinEventBody";
import { getAllEvents, getEventBySlug, hasConfirmedDate } from "@/lib/events";

export function generateStaticParams() {
  return getAllEvents().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};
  return { title: event.title, description: event.summary };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const confirmed = hasConfirmedDate(event);

  return (
    <Section>
      <Eyebrow className="mb-4">
        {event.when} · {event.place}
      </Eyebrow>
      <Heading level={1}>{event.title}</Heading>
      <div className="mt-6">
        <VereinEventBody event={event} />
      </div>

      {confirmed && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              name: event.title,
              startDate: event.isoStart,
              ...(event.isoEnd && { endDate: event.isoEnd }),
              eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
              eventStatus: "https://schema.org/EventScheduled",
              location: {
                "@type": "Place",
                name: event.place,
                address: { "@type": "PostalAddress", addressLocality: "Offenbach am Main", addressCountry: "DE" },
              },
              description: event.summary,
              organizer: { "@type": "Organization", name: "Gewerbeverein Treffpunkt Offenbach e. V." },
            }),
          }}
        />
      )}
    </Section>
  );
}
