import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Eyebrow, Heading, Section } from "@/components/ui";
import { StaticMap } from "@/components/StaticMap";
import {
  MEMBERS_ARE_PLACEHOLDER,
  formatAddress,
  getAllMembers,
  getMemberBySlug,
  getMemberCoords,
  getMemberMapMeta,
  getMembersOnSameStreet,
  toOpeningHoursSpecification,
} from "@/lib/members";

// While the member list is still placeholders, no detail page exists at
// all — not prerendered, and not reachable dynamically either (see
// dynamicParams below). See lib/members.ts for why.
export function generateStaticParams() {
  return MEMBERS_ARE_PLACEHOLDER ? [] : getAllMembers().map((m) => ({ slug: m.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const member = getMemberBySlug(slug);
  if (!member) return {};
  return {
    title: member.name,
    description: member.teaser ?? `${member.name} — ${member.branche} in der ${member.street}, Mitglied im Gewerbeverein Treffpunkt Offenbach.`,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (MEMBERS_ARE_PLACEHOLDER) notFound();
  const member = getMemberBySlug(slug);
  if (!member) notFound();

  const coords = getMemberCoords(member.slug);
  const mapMeta = getMemberMapMeta(member.slug);
  const neighbours = getMembersOnSameStreet(member);
  const address = formatAddress(member);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: member.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: member.houseNumber ? `${member.street} ${member.houseNumber}` : member.street,
      postalCode: member.plz,
      addressLocality: member.city ?? "Offenbach am Main",
      addressCountry: "DE",
    },
    ...(member.phone && { telephone: member.phone }),
    ...(member.email && { email: member.email }),
    ...(member.website && { url: member.website }),
    ...(member.description && { description: member.description }),
    ...(coords && { geo: { "@type": "GeoCoordinates", latitude: coords.lat, longitude: coords.lon } }),
    ...(member.hours && { openingHoursSpecification: toOpeningHoursSpecification(member.hours) }),
  };

  return (
    <Section>
      <Eyebrow className="mb-4">
        <Link href={`/mitglieder?branche=${encodeURIComponent(member.branche)}`} className="link-underline">
          {member.branche}
        </Link>{" "}
        · {member.street}
      </Eyebrow>
      <Heading level={1}>{member.name}</Heading>

      <div className="mt-10 grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-8">
          {(member.description ?? member.teaser) && (
            <p className="prose-body text-[17px]">{member.description ?? member.teaser}</p>
          )}

          <div>
            <p className="eyebrow mb-3">Kontakt</p>
            <address className="not-italic text-[15px] leading-relaxed text-ink-2">
              {address}
              {member.phone && (
                <>
                  <br />
                  <a className="link-underline" href={`tel:${member.phone.replace(/\s/g, "")}`}>
                    {member.phone}
                  </a>
                </>
              )}
              {member.email && (
                <>
                  <br />
                  <a className="link-underline" href={`mailto:${member.email}`}>
                    {member.email}
                  </a>
                </>
              )}
              {member.website && (
                <>
                  <br />
                  <a className="link-underline" href={member.website} target="_blank" rel="noopener noreferrer">
                    {member.website.replace(/^https?:\/\//, "")}
                  </a>
                </>
              )}
            </address>
          </div>

          {member.hours && member.hours.length > 0 && (
            <div>
              <p className="eyebrow mb-3">Öffnungszeiten</p>
              <dl className="flex flex-col gap-1 text-[15px] text-ink-2">
                {member.hours.map((line, i) => (
                  <div key={i} className="flex gap-4">
                    <dt className="w-24 shrink-0 font-mono text-[12px] uppercase tracking-[0.08em] text-muted">
                      {line.days}
                    </dt>
                    <dd className="tnum">{line.hours}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <div>
          <StaticMap slug={member.slug} meta={mapMeta} label={`${member.name}, ${address}`} />
        </div>
      </div>

      {neighbours.length > 0 && (
        <div className="mt-16 border-t pt-10" style={{ borderColor: "var(--c-line)" }}>
          <p className="eyebrow mb-5">Andere Betriebe in der {member.street}</p>
          <ul className="flex flex-col">
            {neighbours.map((n) => (
              <li key={n.slug} className="border-t py-4" style={{ borderColor: "var(--c-line)" }}>
                <Link href={`/mitglieder/${n.slug}`} className="link-underline font-display text-[16px] font-medium">
                  {n.name}
                </Link>
                <span className="ml-3 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">{n.branche}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Section>
  );
}
