import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Chip, Eyebrow, Heading, Section } from "@/components/ui";
import { RadarDeadline } from "@/components/RadarDeadline";
import { IcsDownloadButton } from "@/components/IcsDownloadButton";
import { RadarItemDate, RadarSourceLabel } from "@/components/RadarItemDate";
import {
  RADAR_CATEGORIES,
  RADAR_ITEMS_ARE_PLACEHOLDER,
  getRadarItemBySlug,
  getRadarItems,
  itemSourceDate,
} from "@/lib/radar-content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.treffpunkt-offenbach.com";

// No detail page exists at all while the file only holds specimens — not
// prerendered, and not reachable dynamically either (dynamicParams below).
// Same pattern as /mitglieder/[slug] — see lib/radar-content.ts.
export function generateStaticParams() {
  return RADAR_ITEMS_ARE_PLACEHOLDER ? [] : getRadarItems().map((item) => ({ slug: item.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getRadarItemBySlug(slug);
  if (!item) return {};
  return { title: item.headline, description: item.summary };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (RADAR_ITEMS_ARE_PLACEHOLDER) notFound();
  const item = getRadarItemBySlug(slug);
  if (!item) notFound();

  const cat = RADAR_CATEGORIES[item.category];

  // A calendar item (frequenz) is an Event: startDate/endDate are the
  // source-stated first and last day (schema.org dates, end inclusive), and
  // the location is only what the item itself names — never inferred. Every
  // other item stays an Article, with datePublished only when the source
  // actually carries a publication date.
  const sourceDate = itemSourceDate(item);
  const jsonLd =
    item.category === "frequenz"
      ? {
          "@context": "https://schema.org",
          "@type": "Event",
          name: item.headline,
          description: item.summary,
          startDate: item.date,
          ...(item.dateEnd && item.dateEnd !== item.date ? { endDate: item.dateEnd } : {}),
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: {
            "@type": "Place",
            name: item.place ?? "Offenbach am Main",
            address: { "@type": "PostalAddress", addressLocality: "Offenbach am Main", addressCountry: "DE" },
          },
          url: `${SITE_URL}/radar/${item.slug}`,
        }
      : {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: item.headline,
          description: item.summary,
          ...(sourceDate ? { datePublished: sourceDate } : {}),
          url: `${SITE_URL}/radar/${item.slug}`,
          publisher: { "@type": "Organization", name: "Gewerbeverein Treffpunkt Offenbach e. V." },
        };

  return (
    <Section>
      <Link href="/radar" className="link-underline font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
        ← Alle Meldungen
      </Link>

      <div
        className="mt-6"
        style={{
          borderLeft: item.urgency === "high" ? "3px solid var(--c-signal)" : undefined,
          paddingLeft: item.urgency === "high" ? "18px" : undefined,
        }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <RadarItemDate item={item} className="font-mono text-[11px] tracking-[0.08em] text-muted tnum" />
          <Chip tone={cat.tone}>{cat.label}</Chip>
        </div>

        <Heading level={1} className="mt-4 max-w-[36ch]">
          {item.headline}
        </Heading>

        <p className="prose-body mt-6 max-w-[60ch] text-[17px]">{item.summary}</p>

        {item.place && (
          <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.1em] text-muted">Ort: {item.place}</p>
        )}

        {item.action && (
          <p
            className="mt-6 inline-block max-w-[60ch] px-4 py-3 text-[15px]"
            style={{ background: "var(--c-accent-soft)", color: "var(--c-accent)" }}
          >
            <span className="font-display font-semibold">Was das für Sie heißt: </span>
            {item.action}
          </p>
        )}

        {item.deadline && (
          <RadarDeadline slug={item.slug} headline={item.headline} summary={item.summary} deadline={item.deadline} />
        )}

        {item.category === "frequenz" && (
          <div className="mt-6">
            <IcsDownloadButton
              event={{
                slug: item.slug,
                title: item.headline,
                summary: item.summary,
                location: item.place,
                isoStart: item.date,
                isoEnd: item.dateEnd ?? null,
              }}
            />
          </div>
        )}

        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          Quelle:{" "}
          <a href={item.sourceUrl} className="link-underline" target="_blank" rel="noopener noreferrer">
            <RadarSourceLabel item={item} />
          </a>
          {item.origin === "auto" && " · Automatisch aus der Quelle übernommen"}
        </p>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Section>
  );
}
