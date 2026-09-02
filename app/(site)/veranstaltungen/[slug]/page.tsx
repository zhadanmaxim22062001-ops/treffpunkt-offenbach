import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Eyebrow, Heading, Section } from "@/components/ui";
import { IcsDownloadButton } from "@/components/IcsDownloadButton";
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

function formatGermanDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
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
      <p className="prose-body mt-6 text-[17px]">{event.summary}</p>

      {confirmed ? (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <p className="font-mono text-[13px] tnum text-ink-2">
            {formatGermanDate(event.isoStart)}
            {event.isoEnd && ` – ${formatGermanDate(event.isoEnd)}`}
          </p>
          <IcsDownloadButton
            event={{
              slug: event.slug,
              title: event.title,
              summary: event.summary,
              location: `${event.place}, Offenbach am Main`,
              isoStart: event.isoStart,
              isoEnd: event.isoEnd,
            }}
          />
        </div>
      ) : (
        <p className="mt-8 inline-block px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em]" style={{ background: "var(--c-accent-soft)", color: "var(--c-accent)" }}>
          Termin noch nicht bestätigt
        </p>
      )}

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
