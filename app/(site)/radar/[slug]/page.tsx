import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Chip, Eyebrow, Heading, Section } from "@/components/ui";
import { RadarDeadline } from "@/components/RadarDeadline";
import { RADAR_CATEGORIES, RADAR_ITEMS_ARE_PLACEHOLDER, getRadarItemBySlug, getRadarItems } from "@/lib/radar-content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.treffpunkt-offenbach.com";

// No detail page exists at all while the file only holds specimens — not
// prerendered, and not reachable dynamically either (dynamicParams below).
// Same pattern as /mitglieder/[slug] — see lib/radar-content.ts.
export function generateStaticParams() {
  return RADAR_ITEMS_ARE_PLACEHOLDER ? [] : getRadarItems().map((item) => ({ slug: item.slug }));
}

export const dynamicParams = false;

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.headline,
    description: item.summary,
    datePublished: item.date,
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
          <time className="font-mono text-[11px] tracking-[0.08em] text-muted tnum" dateTime={item.date}>
            {formatDate(item.date)}
          </time>
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

        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          Quelle:{" "}
          <a href={item.sourceUrl} className="link-underline" target="_blank" rel="noopener noreferrer">
            {item.sourceName} · {formatDate(item.date)}
          </a>
          {item.origin === "auto" && " · Automatisch aus der Quelle übernommen"}
        </p>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Section>
  );
}
